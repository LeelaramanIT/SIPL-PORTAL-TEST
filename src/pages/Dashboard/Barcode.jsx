import ZplRenderer from "react-zpl-renderer";

const Barcode = ()=> {

const printLabel = () => {

//   const zpl = `
// ^XA
// ^PW559
// ^LH0,0
// ^CI28
// ^CWZ,E:ARIAL.TTF

// ^FO40,35^BY2
// ^A0,N,50,50
// ^BCN,140,Y,N,N
// ^FDP-010933MZCAA00006A^FS

// ^FO390,305
// ^BXN,4,200
// ^FDGUID:203C834E-7676-4FAB-B5FC-68E340806268:PC:02605001:SN:MZCAA00006:CC:VN^FS

// ^FO70,320^A0N,55,55^FD21X7X15^FS
// ^FO70,390^A0N,55,55^FDSM(0)^FS
// ^FO70,460^A0N,55,55^FDWIDE-TRACK^FS
// ^FO70,520^A0N,55,55^FD^FS
// ^FO70,580^A0N,55,55^FDP-010933^FS

// ^FO33,290
// ^GB500,510,2,B,0

// ^XZ
//   `;

const zpl = `
^XA
^FO35,30
^BY2
^BCN,100,N,N,N
^FDP-193398C180607025A^FS

^FO120,170
^A0N,30,30
^FDP-193398C180607025A^FS

^XZ
`
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

//   const zpl = `
// ^XA
// ^PW559
// ^LH0,0
// ^CI28
// ^CWZ,E:ARIAL.TTF
// ^FO40,25^BY2
// ^A0,N,50,50
// ^BCN,140,Y,N,N^FDP-010933MZCAA00006A^FS
// ^FO390,292
// ^BXN,4,200
// ^FDGUID:203C834E-7676-4FAB-B5FC-68E340806268:PC:02605001:SN:MZCAA00006:CC:VN^FS
// ^FO70,300^A0N,55,55^FD21X7X15^FS
// ^FO70,360^A0N,55,55^FDSM(0)^FS
// ^FO70,420^A0N,55,55^FDWIDE-TRACK^FS
// ^FO70,480^A0N,55,55^FD^FS
// ^FO70,540^A0N,55,55^FDP-010933^FS
// ^FO33,280
// ^GB500,490,2,B,0
// ^XZ
//   `;

const zpl = `
^XA
^FO35,30
^BY2
^BCN,100,N,N,N
^FDP-193398C180607025A^FS

^FO120,170
^A0N,30,30
^FDP-193398C180607025A^FS

^XZ`
  return (
    <div>
      <h3>Label Preview</h3>
      <ZplRenderer zpl={zpl} />
      <button onClick={printLabel}>Print Label</button>
    </div>
  );
}

export default Barcode;