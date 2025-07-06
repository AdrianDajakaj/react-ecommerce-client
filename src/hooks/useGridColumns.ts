import { useEffect, useState } from 'react';

/*
 * Custom hook to determine the number of grid columns based on window width.
 *
 * @returns {number} The number of columns to display
 */
export function useGridColumns() {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    function updateColumns() {
      const width = window.innerWidth;
      if (width >= 1536) setColumns(5);
      else if (width >= 1280) setColumns(4);
      else if (width >= 1024) setColumns(3);
      else if (width >= 640) setColumns(2);
      else setColumns(1);
    }
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  return columns;
}
