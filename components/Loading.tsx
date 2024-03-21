import { Loader } from 'lucide-react'
import React from 'react'

const Loading = () => {
  return (
    <div className='w-full flex justify-center items-center h-72' >
      <div>
        <Loader className='animate-spin'/>
      </div>
    </div>
  )
}

export default Loading  
