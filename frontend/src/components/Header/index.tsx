import React from 'react'
import { GiLighthouse } from 'react-icons/gi'

type Props = {}

const Header = (props: Props) => {
  return (
    <div className='h-[10vh] px-[10vw] flex items-center justify-between'>
        <a className='logo text-4xl font-bold inline-flex items-end gap-2'>
            <span className='pb-1 text-5xl'><GiLighthouse /></span> MENAR
        </a>
    </div>
  )
}

export default Header