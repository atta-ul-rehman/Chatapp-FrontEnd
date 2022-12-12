import React, { useEffect } from 'react'
import {
    Slider,
    SliderTrack,
    SliderFilledTrack,
    SliderThumb,
    Box
  } from '@chakra-ui/react'
import { MdGraphicEq } from "react-icons/md";
  
const Timer = ({ index, setIndex, click }) => {
    
const increment = () => setIndex(i => i + 1);

useEffect(() => {
    if (click) {
    const id = setInterval(increment, 1000);
    return () => clearInterval(id);
    }
}, [click]);
    
  return (
      <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "center",
        width: '100%',
      }}>
       <Slider aria-label='slider-ex-4' value={index} size={'sm'} width={'85%'} display='flex' max={200}>
        <SliderTrack bg='gray.300'>
          <SliderFilledTrack bg='black' />
        </SliderTrack>
        <SliderThumb boxSize={6}>
          <Box as={MdGraphicEq} />
        </SliderThumb>
       </Slider>
          <div style={{ display: 'flex', fontSize: 17, fontWeight: '700', marginLeft:10 }}>
              {index}:00 
          </div>
      </div>
  )
}

export default Timer