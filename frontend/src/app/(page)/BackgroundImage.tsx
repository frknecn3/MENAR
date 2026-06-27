import Image from 'next/image'
import React from 'react'

type Props = {}

const BackgroundImage = (props: Props) => {
    return (
        <div className='absolute left-0 right-0 bottom-0 top-0 -z-1'>
            <Image src='/assets/images/banking.jpg' alt='banking image' fill loading='eager' />
            {/* Overlay */}
            <div className='bg-black opacity-90 absolute top-0 left-0 right-0 bottom-0'></div>
        </div>
    )
}

export default BackgroundImage