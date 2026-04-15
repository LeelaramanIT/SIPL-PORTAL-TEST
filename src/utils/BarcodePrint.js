export const printLabel = (barcode) => {
  const zpl = `
^XA
^BY2,3,94
^FT66,104^BCN,,N,N
^FD${barcode}^FS
^FT151,140^A0N,28,31^FH\
^FD${barcode}^FS
^PQ1,0,1,Y
^XZ
`;
  // const zpl = `
  // ^XA
  // ^FO65,30
  // ^BY2
  // ^BCN,105,N,N,N
  // ^FD${barcode}^FS

  // ^FO140,140
  // ^A0N,30,30
  // ^FD${barcode}^FS
  // ^XZ
  // `

  window.BrowserPrint.getDefaultDevice(
    "printer",
    function (printer) {
      printer.send(
        zpl,
        function () {
          console.log("Label Printed");
        },
        function (error) {
          console.error(error);
        },
      );
    },
    function (error) {
      console.error(error);
    },
  );
};
