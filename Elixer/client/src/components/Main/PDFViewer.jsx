import React, { useState, useEffect, useRef } from 'react';
import { pdfjs } from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';

// Set the workerSrc property to the correct path
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({ url }) => {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageRendering, setPageRendering] = useState(false);
  const [pageNumPending, setPageNumPending] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [scale] = useState(0.8);
  const canvasRef = useRef(null);

  useEffect(() => {
    const fetchPdf = async () => {
      try {
        const loadingTask = pdfjs.getDocument(url);
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setNumPages(pdf.numPages);
        renderPage(pageNum, pdf);
      } catch (error) {
        console.error("Error loading PDF: ", error);
      }
    };
    fetchPdf();
  }, [url]);

  const renderPage = (num, pdf = pdfDoc) => {
    setPageRendering(true);

    pdf.getPage(num).then(page => {
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        setPageRendering(false);
        if (pageNumPending !== null) {
          renderPage(pageNumPending);
          setPageNumPending(null);
        }
      });
    });

    document.getElementById('page_num').textContent = num;
  };

  const queueRenderPage = (num) => {
    if (pageRendering) {
      setPageNumPending(num);
    } else {
      renderPage(num);
    }
  };

  const onPrevPage = () => {
    if (pageNum <= 1) return;
    setPageNum(pageNum - 1);
    queueRenderPage(pageNum - 1);
  };

  const onNextPage = () => {
    if (pageNum >= numPages) return;
    setPageNum(pageNum + 1);
    queueRenderPage(pageNum + 1);
  };

  return (
    <div>
      <h1>PDF.js Previous/Next example</h1>
      <p>Please use <a href="https://mozilla.github.io/pdf.js/getting_started/#download"><i>official releases</i></a> in production environments.</p>
      <div>
        <button id="prev" onClick={onPrevPage}>Previous</button>
        <button id="next" onClick={onNextPage}>Next</button>
        &nbsp; &nbsp;
        <span>Page: <span id="page_num">{pageNum}</span> / <span id="page_count">{numPages}</span></span>
      </div>
      <canvas id="the-canvas" ref={canvasRef}></canvas>
    </div>
  );
};

export default PdfViewer;
