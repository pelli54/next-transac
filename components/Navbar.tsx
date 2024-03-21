import React from 'react'
import ContainerCentered from './ContainerCentered'
import { Button } from './ui/button'
import { Menu } from 'lucide-react'

const Navbar = () => {
  return (
    <ContainerCentered>
      <div className='flex p-3'>
        <Button size={'icon'} variant={'ghost'}><Menu /></Button>
      </div>
    </ContainerCentered>
  )
}

export default Navbar
