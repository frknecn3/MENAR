import yfinance as yf
import random
import json
import sys

# 1. Define a pool of tickers to randomly select from. 
# You can expand this with any symbols from Yahoo Finance.
ticker_pool = ["AAPL", "MSFT", "TSLA", "NVDA", "JNJ", "V", "WMT", "JPM", "AMD"]
selected_symbol = random.choice(ticker_pool)

def fetch_random_stock():
    try:
        # 2. Initialize the Ticker object
        stock = yf.Ticker(selected_symbol)
        
        # 3. Fetch the detailed dictionary. 
        # The .info object contains dozens of metrics, descriptions, and current prices.
        details = stock.info
        
        # 4. Extract the exact data points we care about into a clean dictionary.
        # We use .get() so the script doesn't crash if Yahoo is missing a specific field.
        output_data = {
            "symbol": selected_symbol,
            "company_name": details.get("shortName", "N/A"),
            "sector": details.get("sector", "N/A"),
            "current_price": details.get("currentPrice", "N/A"),
            "previous_close": details.get("regularMarketPreviousClose", "N/A"),
            "volume": details.get("volume", "N/A"),
            "fifty_two_week_high": details.get("fiftyTwoWeekHigh", "N/A"),
            # Truncating the summary so it doesn't flood your console
            "summary": details.get("longBusinessSummary", "N/A")[:150] + "..." 
        }
        
        # 5. Print out the JSON string so Node.js can easily grab it
        print(json.dumps(output_data, indent=2))
        
    except Exception as e:
        # If Yahoo Finance blocks the request or fails, output the error as JSON too
        error_output = {
            "error": True, 
            "message": str(e), 
            "symbol": selected_symbol
        }
        print(json.dumps(error_output))
        sys.exit(1)

if __name__ == "__main__":
    fetch_random_stock()