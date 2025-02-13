
import { useEffect } from 'react';

export const useCustomFont = () => {
  useEffect(() => {
    const loadFont = async () => {
      const font = new FontFace(
        'Quicksand',
        'url(https://fonts.gstatic.com/s/quicksand/v30/6xKtdSZaM9iE8KbpRA_hK1QN.woff2)'
      );

      try {
        await font.load();
        document.fonts.add(font);
        console.log('Quicksand font loaded successfully');
      } catch (error) {
        console.error('Error loading Quicksand font:', error);
      }
    };

    loadFont();
  }, []);
};
