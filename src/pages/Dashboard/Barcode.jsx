import ZplRenderer from "react-zpl-renderer";

const Barcode = ()=> {

const printLabel = () => {

  const zpl = `
  ^XA
^FO150,50
^BY3
^BCN,200,Y,N,N
^FDP-193398C180607025A^FS
^FO120,170
^A0N,30,30
^XZ
  `;

  window.BrowserPrint.getDefaultDevice("printer", function(printer){

    printer.send(zpl, function(){
      console.log("Label Printed");
    }, function(error){
      console.error(error);
    });

  }, function(error){
    console.error(error);
  });

};

  const zpl = `
^XA
^FO150,50
^BY3
^BCN,200,Y,N,N
^FDP-193398C180607025A^FS
^FO120,170
^A0N,30,30
^XZ
  `;

  return (
    <div>
      <h3>Label Preview</h3>
      <ZplRenderer zpl={zpl} />
      <button onClick={printLabel}>Print Label</button>
    </div>
  );
}

export default Barcode;