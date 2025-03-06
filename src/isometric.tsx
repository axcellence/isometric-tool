import React, { useState, useEffect, useRef, ChangeEvent } from 'react';

export function Isometric() {
  // State for all transformation values
  const [scale, setScale] = useState<number>(1);
  const [rotateX, setRotateX] = useState<number>(35.264);
  const [rotateY, setRotateY] = useState<number>(45);
  const [rotateZ, setRotateZ] = useState<number>(0);
  const [translateX, setTranslateX] = useState<number>(0);
  const [translateY, setTranslateY] = useState<number>(0);
  const [translateZ, setTranslateZ] = useState<number>(0);
  const [showCube, setShowCube] = useState<boolean>(true);
  const [matrixOutput, setMatrixOutput] = useState<string>('transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);');
  const [copyButtonText, setCopyButtonText] = useState<string>('Copy CSS');

  // Refs for accessing DOM elements
  const xAxisRef = useRef<HTMLDivElement>(null);
  const yAxisRef = useRef<HTMLDivElement>(null);
  const zAxisRef = useRef<HTMLDivElement>(null);

  // Helper function to convert degrees to radians
  const toRadians = (degrees: number): number => {
    return degrees * Math.PI / 180;
  };
  
  // Helper function to multiply two matrices
  const multiplyMatrices = (a: number[], b: number[]): number[] => {
    const result = new Array(16).fill(0);
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        for (let k = 0; k < 4; k++) {
          result[i * 4 + j] += a[i * 4 + k] * b[k * 4 + j];
        }
      }
    }
    
    return result;
  };
  
  // Function to create a scaling matrix
  const createScaleMatrix = (scale: number): number[] => {
    return [
      scale, 0, 0, 0,
      0, scale, 0, 0,
      0, 0, scale, 0,
      0, 0, 0, 1
    ];
  };
  
  // Function to create a translation matrix
  const createTranslationMatrix = (tx: number, ty: number, tz: number): number[] => {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1
    ];
  };
  
  // Function to create a rotation matrix around X axis
  const createRotationXMatrix = (degrees: number): number[] => {
    const radians = toRadians(degrees);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    return [
      1, 0, 0, 0,
      0, cos, sin, 0,
      0, -sin, cos, 0,
      0, 0, 0, 1
    ];
  };
  
  // Function to create a rotation matrix around Y axis
  const createRotationYMatrix = (degrees: number): number[] => {
    const radians = toRadians(degrees);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    return [
      cos, 0, -sin, 0,
      0, 1, 0, 0,
      sin, 0, cos, 0,
      0, 0, 0, 1
    ];
  };
  
  // Function to create a rotation matrix around Z axis
  const createRotationZMatrix = (degrees: number): number[] => {
    const radians = toRadians(degrees);
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    
    return [
      cos, sin, 0, 0,
      -sin, cos, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  };
  
  // Function to format the matrix for CSS output
  const formatMatrix = (matrix: number[]): string => {
    return `matrix3d(${matrix.map(n => n.toFixed(6)).join(', ')})`;
  };
  
  // Function to transform a vector with a matrix
  const transformVector = (vector: number[], matrix: number[]): number[] => {
    const result = [0, 0, 0, 0];
    
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        result[i] += vector[j] * matrix[j * 4 + i];
      }
    }
    
    return result;
  };

  // Function to update the coordinate axes
  const updateAxes = (rotX: number, rotY: number, rotZ: number): void => {
    if (!xAxisRef.current || !yAxisRef.current || !zAxisRef.current) return;
    
    // Create rotation matrices
    const rotateXMatrix = createRotationXMatrix(rotX);
    const rotateYMatrix = createRotationYMatrix(rotY);
    const rotateZMatrix = createRotationZMatrix(rotZ);
    
    // Combine rotation matrices
    let rotationMatrix = rotateXMatrix;
    rotationMatrix = multiplyMatrices(rotationMatrix, rotateYMatrix);
    rotationMatrix = multiplyMatrices(rotationMatrix, rotateZMatrix);
    
    // Original axis vectors (pointing right, down, toward viewer)
    const xAxisVector = [1, 0, 0, 1];
    const yAxisVector = [0, 1, 0, 1];
    const zAxisVector = [0, 0, 1, 1];
    
    // Transform the axis vectors
    const transformedXAxis = transformVector(xAxisVector, rotationMatrix);
    const transformedYAxis = transformVector(yAxisVector, rotationMatrix);
    const transformedZAxis = transformVector(zAxisVector, rotationMatrix);
    
    // Apply transforms to the axis elements
    xAxisRef.current.style.transform = `rotate(${Math.atan2(transformedXAxis[1], transformedXAxis[0]) * 180 / Math.PI}deg)`;
    yAxisRef.current.style.transform = `rotate(${Math.atan2(transformedYAxis[1], transformedYAxis[0]) * 180 / Math.PI}deg)`;
    zAxisRef.current.style.transform = `rotate(${Math.atan2(transformedZAxis[1], transformedZAxis[0]) * 180 / Math.PI}deg)`;
  };

  // Function to update the transformation
  const updateTransform = (): void => {
    // Create individual transformation matrices
    const scaleMatrix = createScaleMatrix(scale);
    const rotateXMatrix = createRotationXMatrix(rotateX);
    const rotateYMatrix = createRotationYMatrix(rotateY);
    const rotateZMatrix = createRotationZMatrix(rotateZ);
    const translateMatrix = createTranslationMatrix(translateX, translateY, translateZ);
    
    // Combine all matrices (order matters)
    // The transformation order is: scale -> rotateX -> rotateY -> rotateZ -> translate
    let resultMatrix = scaleMatrix;
    resultMatrix = multiplyMatrices(resultMatrix, rotateXMatrix);
    resultMatrix = multiplyMatrices(resultMatrix, rotateYMatrix);
    resultMatrix = multiplyMatrices(resultMatrix, rotateZMatrix);
    resultMatrix = multiplyMatrices(resultMatrix, translateMatrix);
    
    // Update the CSS output
    setMatrixOutput(formatMatrix(resultMatrix));
    
    // Update the axes
    updateAxes(rotateX, rotateY, rotateZ);
  };

  // Toggle between cube and square view
  const toggleCubeView = (): void => {
    setShowCube(!showCube);
  };

  // Handle input changes
  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>) => 
    (e: ChangeEvent<HTMLInputElement>) => {
      setter(parseFloat(e.target.value));
    };

  // Apply preset configurations
  const applyPreset = (preset: 'isometric' | 'dimetric' | 'cabinet' | 'reset'): void => {
    switch (preset) {
      case 'isometric':
        setRotateX(35.264);
        setRotateY(45);
        setRotateZ(0);
        break;
      case 'dimetric':
        setRotateX(30);
        setRotateY(45);
        setRotateZ(0);
        break;
      case 'cabinet':
        setRotateX(0);
        setRotateY(45);
        setRotateZ(0);
        break;
      case 'reset':
        setScale(1);
        setRotateX(0);
        setRotateY(0);
        setRotateZ(0);
        setTranslateX(0);
        setTranslateY(0);
        setTranslateZ(0);
        break;
    }
  };

  // Copy CSS to clipboard
  const copyCss = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(`transform: ${matrixOutput};`);
      setCopyButtonText('Copied!');
      setTimeout(() => {
        setCopyButtonText('Copy CSS');
      }, 2000);
    } catch (err) {
      console.error('Could not copy text: ', err);
    }
  };

  // Update transform whenever any of the transformation values change
  useEffect(() => {
    updateTransform();
  }, [scale, rotateX, rotateY, rotateZ, translateX, translateY, translateZ]);

  // Set isometric projection as default on initial render
  useEffect(() => {
    applyPreset('isometric');
  }, []);

  // No need to extract or modify the matrix output anymore
  // const cssTransform = matrixOutput.split(': ')[1].replace(';', '');
  console.log(matrixOutput);

  return (
    <div className="container">
      <div className="controls">
        <h2>Controls</h2>

        <div className="form-group">
          <label htmlFor="scale">Scale:</label>
          <div className="slider-container">
            <input
              type="range"
              id="scale"
              min="0.1"
              max="3"
              step="0.1"
              value={scale}
              onChange={handleInputChange(setScale)}
            />
            <input
              type="number"
              id="scale-value"
              min="0.1"
              max="3"
              step="0.1"
              value={scale}
              onChange={handleInputChange(setScale)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rotateX">Rotate X:</label>
          <div className="slider-container">
            <input
              type="range"
              id="rotateX"
              min="-180"
              max="180"
              step="1"
              value={rotateX}
              onChange={handleInputChange(setRotateX)}
            />
            <input
              type="number"
              id="rotateX-value"
              min="-180"
              max="180"
              step="1"
              value={rotateX}
              onChange={handleInputChange(setRotateX)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rotateY">Rotate Y:</label>
          <div className="slider-container">
            <input
              type="range"
              id="rotateY"
              min="-180"
              max="180"
              step="1"
              value={rotateY}
              onChange={handleInputChange(setRotateY)}
            />
            <input
              type="number"
              id="rotateY-value"
              min="-180"
              max="180"
              step="1"
              value={rotateY}
              onChange={handleInputChange(setRotateY)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rotateZ">Rotate Z:</label>
          <div className="slider-container">
            <input
              type="range"
              id="rotateZ"
              min="-180"
              max="180"
              step="1"
              value={rotateZ}
              onChange={handleInputChange(setRotateZ)}
            />
            <input
              type="number"
              id="rotateZ-value"
              min="-180"
              max="180"
              step="1"
              value={rotateZ}
              onChange={handleInputChange(setRotateZ)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="translateX">Translate X:</label>
          <div className="slider-container">
            <input
              type="range"
              id="translateX"
              min="-100"
              max="100"
              step="1"
              value={translateX}
              onChange={handleInputChange(setTranslateX)}
            />
            <input
              type="number"
              id="translateX-value"
              min="-100"
              max="100"
              step="1"
              value={translateX}
              onChange={handleInputChange(setTranslateX)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="translateY">Translate Y:</label>
          <div className="slider-container">
            <input
              type="range"
              id="translateY"
              min="-100"
              max="100"
              step="1"
              value={translateY}
              onChange={handleInputChange(setTranslateY)}
            />
            <input
              type="number"
              id="translateY-value"
              min="-100"
              max="100"
              step="1"
              value={translateY}
              onChange={handleInputChange(setTranslateY)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="translateZ">Translate Z:</label>
          <div className="slider-container">
            <input
              type="range"
              id="translateZ"
              min="-100"
              max="100"
              step="1"
              value={translateZ}
              onChange={handleInputChange(setTranslateZ)}
            />
            <input
              type="number"
              id="translateZ-value"
              min="-100"
              max="100"
              step="1"
              value={translateZ}
              onChange={handleInputChange(setTranslateZ)}
            />
          </div>
        </div>

        <div className="view-toggle">
          <button onClick={toggleCubeView}>
            Toggle Cube/Square View
          </button>
        </div>

        <div className="presets">
          <h3>Presets</h3>
          <button onClick={() => applyPreset('isometric')}>Classic Isometric</button>
          <button onClick={() => applyPreset('dimetric')}>Dimetric</button>
          <button onClick={() => applyPreset('cabinet')}>Cabinet</button>
          <button onClick={() => applyPreset('reset')}>Reset</button>
        </div>

        <div className="output">
          <h3>CSS Output</h3>
          <div className="code">
            {`transform: ${matrixOutput};`}
          </div>
          <button className="copy-button" onClick={copyCss}>
            {copyButtonText}
          </button>
        </div>
      </div>

      <div className="preview">
        <h2>Preview</h2>
        <div className="preview-container">
          <div 
            className="square" 
            style={{ 
              display: showCube ? 'none' : 'block',
              transform: matrixOutput 
            }}
          ></div>
          {/* 3D Cube for better visualization */}
          <div 
            className="cube" 
            style={{ 
              display: showCube ? 'block' : 'none',
              transform: matrixOutput,
            }}
          >
            <div className="cube-face front">Front</div>
            <div className="cube-face back">Back</div>
            <div className="cube-face right">Right</div>
            <div className="cube-face left">Left</div>
            <div className="cube-face top">Top</div>
            <div className="cube-face bottom">Bottom</div>
          </div>
          <div className="axes">
            <div className="axis x" ref={xAxisRef}></div>
            <div className="axis y" ref={yAxisRef}></div>
            <div className="axis z" ref={zAxisRef}></div>
          </div>
        </div>
        <div className="info-panel">
          <p>Red = X axis, Green = Y axis, Blue = Z axis</p>
          <p>
            For true isometric projection, X and Z axes should make 30° angles
            with the horizontal.
          </p>
        </div>
      </div>
    </div>
  );
}
