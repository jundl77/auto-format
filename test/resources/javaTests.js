const test1 = {
  "label": "Extra method on top and part of method below",
  "offset": 10,
  "selectionStart": 14,
  "selectionEnd": 14,
  "newSnippetStart": 7,
  "newSnippetEnd": 24,
  "selection": ["inputStream.close();"],




  "code":`
           @Override
      public boolean connected() {
    return connected;
          }

       @Override
public void close() throws IOException {
       Logger.getLogger(I2CDevice.class.getName()).log(Level.INFO,
          "Closing device on {0}", serialPort.getName());
            //send("X");
  connected = false;
  try {
          inputStream.close();
  } catch (Exception e) {
  }
        try {
    outputStream.close();
  } catch (Exception e) {
                   }
         try {
    if (serialPort != null) {
                serialPort.close();
           }
       } catch (Exception e) {
  }
}

           public void open() throws IOException {
       try {
    if (portName != null) {
               portId = CommPortIdentifier.getPortIdentifier(portName);
    }`,




  "formatResult": `@Override
public boolean connected() {
    return connected;
}

@Override
public void close() throws IOException {
    Logger.getLogger(I2CDevice.class.getName()).log(Level.INFO,
    "Closing device on {0}", serialPort.getName());
    //send("X");
    connected = false;
    try {
        inputStream.close();
    } catch (Exception e) {
    }
    try {
        outputStream.close();
    } catch (Exception e) {
    }
    try {
        if (serialPort != null) {
            serialPort.close();
        }
    } catch (Exception e) {
    }
}

public void open() throws IOException {
    try {
        if (portName != null) {
            portId = CommPortIdentifier.getPortIdentifier(portName);
        }`,




  "formatSnippetResult": `@Override
public void close() throws IOException {
    Logger.getLogger(I2CDevice.class.getName()).log(Level.INFO,
    "Closing device on {0}", serialPort.getName());
    //send("X");
    connected = false;
    try {
        inputStream.close();
    } catch (Exception e) {
    }
    try {
        outputStream.close();
    } catch (Exception e) {
    }
    try {
        if (serialPort != null) {
            serialPort.close();
        }`
}

export default {
  "indentationToken": "    ",
  "tests": [test1]
}