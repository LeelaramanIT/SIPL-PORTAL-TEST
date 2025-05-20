import axios from "axios";
// import InvoiceBill from "../TTS/Invoice/International/Export Invoice/InvoiceBill";
import { BackendUrl } from "../../App";

const Home = () => {

  const handleApiCall = async()=>{
    const res = await axios.get(`${BackendUrl}/api/Invoice/getInvoiceNo`)
    console.log(res.data);
    console.log(res.status);
  }
  return (
 <>
 <div>
  {/* <InvoiceBill/> */}

  <button onClick={handleApiCall}>get invoice</button>
  </div>
 </>
  );
};

export default Home;
