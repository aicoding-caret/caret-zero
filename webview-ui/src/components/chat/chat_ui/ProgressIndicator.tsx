import React from 'react'
import styled, { keyframes } from 'styled-components'

/**
 * ub85cub529 uc0c1ud0dcub97c ub098ud0c0ub0b4ub294 ud68cuc804 uc560ub2c8uba54uc774uc158 uc9c4ud589 ud45cuc2dcuae30
 */
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

/**
 * ud68cuc804ud558ub294 ub85cub529 ud45cuc2dcuae30 uc2a4ud0c0uc77c ucef4ud3ecub10cud2b8
 */
const Spinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid var(--vscode-editor-foreground);
  border-radius: 50%;
  border-top-color: transparent;
  animation: ${rotate} 1s linear infinite;
`

/**
 * uc9c4ud589 ud45cuc2dcuae30 ucef4ud3ecub10cud2b8
 * ube0cub77cuc6b0uc800 ub3d9uc791 uc911 ub85cub529 uc0c1ud0dcub97c uc2dcuac01uc801uc73cub85c ud45cuc2dc
 */
const ProgressIndicator: React.FC = () => {
  return <Spinner aria-label="uc791uc5c5 uc9c4ud589 uc911" />;
}

export default ProgressIndicator
