from __future__ import annotations

import json
import re
import sys
import hashlib
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urljoin

import pdfplumber
import requests
from bs4 import BeautifulSoup
from requests.packages.urllib3.exceptions import InsecureRequestWarning

try:
    from curl_cffi import requests as crequests  # type: ignore
except Exception:
    crequests = None

requests.packages.urllib3.disable_warnings(category=InsecureRequestWarning)

BASE_URL = "https://analizim.halkyatirim.com.tr"
LISTING_PATH = "/Analysis/FinancialRadar"
TARGET_HEADER = "BIST 100 Temel Skorları"
DEFAULT_MAX_PAGES = 50
REQUEST_TIMEOUT = 45

ROOT_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT_DIR / "data"
TMP_DIR = DATA_DIR / "financial_radar_tmp"

USER_AGENT = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)

DATE_PATTERNS = [
    "%d.%m.%Y %H:%M:%S",
    "%d.%m.%Y",
    "%d/%m/%Y",
    "%Y-%m-%d",
]

NUMERIC_RE = re.compile(r"^-?[\d.,]+%?$")
PDF_RE = re.compile(r"https?://[^\"'\s>]+\.pdf(?:\?[^\"'\s>]*)?", re.IGNORECASE)


@dataclass
class ReportEntry:
    page_number: int
    report_date: str | None
    detail_url: str | None
    pdf_url: str


class FinancialRadarError(Exception):
    pass


class HttpClient:
    def __init__(self) -> None:
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})

    def get_text(self, url: str) -> str:
        errors: list[str] = []

        if crequests is not None:
            try:
                response = crequests.get(url, impersonate="chrome124", timeout=REQUEST_TIMEOUT, verify=False)
                response.raise_for_status()
                return response.text
            except Exception as exc:
                errors.append(f"curl_cffi: {exc}")

        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT, verify=False)
            response.raise_for_status()
            return response.text
        except Exception as exc:
            errors.append(f"requests: {exc}")

        raise FinancialRadarError("Kaynak sayfa alınamadı. " + " | ".join(errors))

    def get_bytes(self, url: str) -> bytes:
        errors: list[str] = []

        if crequests is not None:
            try:
                response = crequests.get(url, impersonate="chrome124", timeout=REQUEST_TIMEOUT, verify=False)
                response.raise_for_status()
                return response.content
            except Exception as exc:
                errors.append(f"curl_cffi: {exc}")

        try:
            response = self.session.get(url, timeout=REQUEST_TIMEOUT, verify=False)
            response.raise_for_status()
            return response.content
        except Exception as exc:
            errors.append(f"requests: {exc}")

        raise FinancialRadarError("PDF indirilemedi. " + " | ".join(errors))


def listing_url(page_number: int) -> str:
    return f"{BASE_URL}{LISTING_PATH}?pageNum={page_number}"


def clean_space(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def normalize_key(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9çğıöşüÇĞİÖŞÜ]+", "_", value.strip().lower())
    normalized = normalized.strip("_")
    return normalized or "value"


def parse_date(date_text: str | None) -> str | None:
    if not date_text:
        return None
    text = clean_space(date_text)
    for pattern in DATE_PATTERNS:
        try:
            return datetime.strptime(text, pattern).date().isoformat()
        except ValueError:
            continue
    match = re.search(r"(\d{2}\.\d{2}\.\d{4})", text)
    if match:
        try:
            return datetime.strptime(match.group(1), "%d.%m.%Y").date().isoformat()
        except ValueError:
            return None
    return None


def file_safe_date(date_value: str | None, fallback: str) -> str:
    if date_value:
        return date_value
    return fallback


def find_pdf_urls_from_html(html: str, base_url: str) -> list[str]:
    soup = BeautifulSoup(html, "html.parser")
    urls: list[str] = []

    for tag in soup.find_all(["a", "iframe", "embed", "object"]):
        candidate = tag.get("href") or tag.get("src") or tag.get("data")
        if candidate and ".pdf" in candidate.lower():
            urls.append(urljoin(base_url, candidate))

    for match in PDF_RE.findall(html):
        urls.append(urljoin(base_url, match))

    deduped: list[str] = []
    seen: set[str] = set()
    for url in urls:
        clean_url = url.replace("\\/", "/")
        if clean_url not in seen:
            seen.add(clean_url)
            deduped.append(clean_url)
    return deduped


def extract_report_entries(listing_html: str, page_number: int) -> list[ReportEntry]:
    soup = BeautifulSoup(listing_html, "html.parser")
    pdf_urls = find_pdf_urls_from_html(listing_html, listing_url(page_number))

    entries: list[ReportEntry] = []
    if pdf_urls:
        for pdf_url in pdf_urls:
            entries.append(ReportEntry(page_number=page_number, report_date=None, detail_url=None, pdf_url=pdf_url))
        return entries

    anchors = soup.find_all("a", href=True)
    for anchor in anchors:
        href = anchor.get("href", "")
        anchor_text = clean_space(anchor.get_text(" ", strip=True))
        if "financialradar" not in href.lower() and "görüntülemek" not in anchor_text.lower() and "tıklayın" not in anchor_text.lower():
            continue

        container = anchor.parent
        container_text = clean_space(container.get_text(" ", strip=True) if container else anchor_text)
        date_match = re.search(r"\d{2}\.\d{2}\.\d{4}(?:\s+\d{2}:\d{2}:\d{2})?", container_text)
        detail_url = urljoin(listing_url(page_number), href)
        entries.append(
            ReportEntry(
                page_number=page_number,
                report_date=parse_date(date_match.group(0) if date_match else None),
                detail_url=detail_url,
                pdf_url="",
            )
        )

    return entries


def resolve_pdf_url(client: HttpClient, entry: ReportEntry) -> ReportEntry | None:
    if entry.pdf_url:
        return entry
    if not entry.detail_url:
        return None

    detail_html = client.get_text(entry.detail_url)
    pdf_urls = find_pdf_urls_from_html(detail_html, entry.detail_url)
    if not pdf_urls:
        return None

    return ReportEntry(
        page_number=entry.page_number,
        report_date=entry.report_date,
        detail_url=entry.detail_url,
        pdf_url=pdf_urls[0],
    )


def write_temp_pdf(pdf_bytes: bytes, slug: str) -> Path:
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    pdf_path = TMP_DIR / f"{slug}.pdf"
    pdf_path.write_bytes(pdf_bytes)
    return pdf_path


def table_rows_to_objects(rows: list[list[str | None]]) -> tuple[list[str], list[dict[str, Any]]]:
    cleaned_rows = [[clean_space(cell or "") for cell in row] for row in rows if any(clean_space(cell or "") for cell in row)]
    if not cleaned_rows:
        return [], []

    header = cleaned_rows[0]
    body = cleaned_rows[1:]

    objects: list[dict[str, Any]] = []
    for row in body:
        normalized_row = row + [""] * max(0, len(header) - len(row))
        item: dict[str, Any] = {}
        for index, key in enumerate(header):
            column_name = normalize_key(key or f"column_{index + 1}")
            value = normalized_row[index] if index < len(normalized_row) else ""
            item[column_name] = convert_value(value)
        objects.append(item)

    return header, objects


def convert_value(value: str) -> Any:
    cleaned = clean_space(value)
    if cleaned == "":
        return ""
    numeric_candidate = cleaned.replace(".", "").replace(",", ".").replace("%", "")
    if NUMERIC_RE.match(cleaned):
        try:
            if cleaned.endswith("%"):
                return float(numeric_candidate)
            if "." in numeric_candidate:
                return float(numeric_candidate)
            return int(numeric_candidate)
        except ValueError:
            return cleaned
    return cleaned


def extract_target_page_table(pdf_path: Path) -> dict[str, Any] | None:
    with pdfplumber.open(str(pdf_path)) as pdf:
        for page_index, page in enumerate(pdf.pages, start=1):
            page_text = page.extract_text() or ""
            if TARGET_HEADER.lower() not in page_text.lower():
                continue

            tables = page.extract_tables(
                {
                    "vertical_strategy": "lines",
                    "horizontal_strategy": "lines",
                    "intersection_tolerance": 5,
                    "snap_tolerance": 3,
                }
            )
            if not tables:
                tables = page.extract_tables(
                    {
                        "vertical_strategy": "text",
                        "horizontal_strategy": "text",
                        "text_x_tolerance": 2,
                        "text_y_tolerance": 2,
                    }
                )

            for table in tables:
                if not table:
                    continue
                header, records = table_rows_to_objects(table)
                if not header or not records:
                    continue
                header_text = " ".join(header).lower()
                if "kod" not in header_text and "hisse" not in header_text:
                    continue
                return {
                    "page_number": page_index,
                    "table_header": header,
                    "records": records,
                    "raw_text_excerpt": page_text[:2000],
                }
    return None


def save_week_json(report_date: str | None, table_payload: dict[str, Any], source_pdf_url: str, source_page_number: int) -> str:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    fallback = f"page_{source_page_number}_{hashlib.md5(source_pdf_url.encode()).hexdigest()[:8]}"
    file_date = file_safe_date(report_date, fallback)
    file_name = f"financial_radar_bist100_{file_date}.json"
    output_path = DATA_DIR / file_name

    payload = {
        "report_date": report_date,
        "source_pdf_url": source_pdf_url,
        "captured_at": datetime.utcnow().isoformat() + "Z",
        "target_header": TARGET_HEADER,
        "page_number": table_payload["page_number"],
        "table_header": table_payload["table_header"],
        "records": table_payload["records"],
        "record_count": len(table_payload["records"]),
        "raw_text_excerpt": table_payload["raw_text_excerpt"],
    }

    output_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    return str(output_path)


def crawl_report_entries(client: HttpClient, max_pages: int) -> list[ReportEntry]:
    collected: list[ReportEntry] = []
    seen_pdf_urls: set[str] = set()

    for page_number in range(1, max_pages + 1):
        html = client.get_text(listing_url(page_number))
        entries = extract_report_entries(html, page_number)
        if not entries:
            break

        resolved_any = False
        for entry in entries:
            try:
                resolved = resolve_pdf_url(client, entry)
            except Exception:
                continue
            if not resolved or not resolved.pdf_url:
                continue
            if resolved.pdf_url in seen_pdf_urls:
                continue
            seen_pdf_urls.add(resolved.pdf_url)
            collected.append(resolved)
            resolved_any = True

        if not resolved_any and page_number > 3:
            break

    return collected


def process_reports(max_pages: int = DEFAULT_MAX_PAGES) -> dict[str, Any]:
    client = HttpClient()
    entries = crawl_report_entries(client, max_pages=max_pages)
    if not entries:
        raise FinancialRadarError("Financial Radar sayfalarında indirilebilir PDF bulunamadı.")

    saved_files: list[dict[str, Any]] = []
    failures: list[dict[str, str]] = []

    for index, entry in enumerate(entries, start=1):
        slug_seed = entry.report_date or f"report_{index}"
        slug = re.sub(r"[^a-zA-Z0-9_-]+", "_", slug_seed)
        try:
            pdf_bytes = client.get_bytes(entry.pdf_url)
            pdf_path = write_temp_pdf(pdf_bytes, slug)
            table_payload = extract_target_page_table(pdf_path)
            if not table_payload:
                failures.append(
                    {
                        "pdf_url": entry.pdf_url,
                        "reason": f"'{TARGET_HEADER}' sayfası veya tablo bulunamadı.",
                    }
                )
                continue

            output_path = save_week_json(
                report_date=entry.report_date,
                table_payload=table_payload,
                source_pdf_url=entry.pdf_url,
                source_page_number=entry.page_number,
            )
            saved_files.append(
                {
                    "report_date": entry.report_date,
                    "pdf_url": entry.pdf_url,
                    "output_path": output_path,
                    "record_count": len(table_payload["records"]),
                }
            )
        except Exception as exc:
            failures.append(
                {
                    "pdf_url": entry.pdf_url,
                    "reason": str(exc),
                }
            )

    return {
        "success": True,
        "message": "Financial Radar BIST100 haftalık JSON dosyaları üretildi.",
        "saved_file_count": len(saved_files),
        "saved_files": saved_files,
        "failure_count": len(failures),
        "failures": failures,
    }


def main() -> None:
    max_pages = DEFAULT_MAX_PAGES
    if len(sys.argv) > 1:
        try:
            max_pages = max(1, int(sys.argv[1]))
        except ValueError:
            raise FinancialRadarError("Geçersiz sayfa sınırı verildi.")

    try:
        result = process_reports(max_pages=max_pages)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as exc:
        error_output = {
            "success": False,
            "message": str(exc),
        }
        print(json.dumps(error_output, ensure_ascii=False, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
