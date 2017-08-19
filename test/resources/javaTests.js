const testGeneral = {
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

const testStringWithBraces = {
  "label": "Snippet with braces inside string",
  "offset": 2,
  "selectionStart": 5,
  "selectionEnd": 5,
  "newSnippetStart": 4,
  "newSnippetEnd": 7,
  "selection": ["System.out.println(\"Hello, World\");"],
  "code":`
             public class HelloWorld {
  
                             public static void main(String[] args) {
        System.out.println("Hello, World");
 System.out.println("}}}}}}");
    }
 }`,
  "formatResult":`public class HelloWorld {
    
    public static void main(String[] args) {
        System.out.println("Hello, World");
        System.out.println("}}}}}}");
    }
}`,
  "formatSnippetResult":`public static void main(String[] args) {
    System.out.println("Hello, World");
    System.out.println("}}}}}}");
}`
}

export default {
  "indentationToken": "    ",
  "tests": [testGeneral, testStringWithBraces]
}