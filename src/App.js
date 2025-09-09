import React, {useState} from "react";
import UploadDocument  from "./components/UploadDocument";


function App() {
    const [screen, setScreen ] = useState("upload");


    return(
        <div className="App">
            {screen === "upload" && <UploadDocument onSuccess= {() => setScreen("success")} />}
        </div>
    );
}

export default App;
