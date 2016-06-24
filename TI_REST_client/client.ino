
#ifndef __CC3200R1M1RGC__
// Do not include SPI for CC3200 LaunchPad
#include <SPI.h>
#endif
#include <WiFi.h>

#define USERAGENT      "CC3100 LaunchPad"     // user agent is the project name

// your network name also called SSID
char ssid[] = "TP-LINK_MAKERS";
// your network password
char password[] = "MAKERS-NS";

// initialize the library instance:
WiFiClient client;
// if you don't want to use DNS (and reduce your sketch size)
// use the numeric IP instead of the name for the server:
//IPAddress server(216,52,233,121);      // numeric IP for api.xively.com
char server[] = "makersns.azurewebsites.net";   // name address for web app

unsigned long lastConnectionTime = 0;          // last time you connected to the server, in milliseconds
boolean lastConnected = false;                 // state of the connection last time through the main loop
const unsigned long postingInterval = 15*1000; //delay between updates to xively.com
boolean sent = false;

void setup() {

  Serial.begin(115200);

  // attempt to connect to Wifi network:
  Serial.print("Attempting to connect to Network named: ");
  // print the network name (SSID);
  Serial.println(ssid); 
  // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
  WiFi.begin(ssid, password);
  while ( WiFi.status() != WL_CONNECTED) {
    // print dots while we wait to connect
    Serial.print(".");
    delay(300);
  }
  
  Serial.println("\nYou're connected to the network");
  Serial.println("Waiting for an ip address");
  
  while (WiFi.localIP() == INADDR_NONE) {
    // print dots while we wait for an ip addresss
    Serial.print(".");
    delay(300);
  }

  Serial.println("\nIP Address obtained");
  printWifiStatus();
}


void loop() {
  // read the analog sensor:
  int sensorReading = analogRead(A0);

  // if there's incoming data from the net connection.
  // send it out the serial port.  This is for debugging
  // purposes only:
  while (client.available()) {
    char c = client.read();
    Serial.print(c);
  }

  // if there's no net connection, but there was one last time
  // through the loop, then stop the client:
  if (!client.connected() && lastConnected) {
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();
  }

  // if you're not connected, and ten seconds have passed since
  // your last connection, then connect again and send data:
  //if (!client.connected() && (millis() - lastConnectionTime > postingInterval) &&(!sent)) {
  if (!client.connected() && (millis() - lastConnectionTime > postingInterval) ) {
    String body = "{\"device\" : \"texas\", \"value\" : " + String(sensorReading)+"}";
    sendData(body);
    sent = true;
  }
  // store the state of the connection for next time through
  // the loop:
  lastConnected = client.connected();
}

// this method makes a HTTP connection to the server:
void sendData(String thisData) {
  // if there's a successful connection:
  if (client.connect(server, 80)) {
    Serial.println("connecting...");

    client.print("POST /texas ");

    client.println("HTTP/1.1 ");
    client.println("Host: makersns.azurewebsites.net");

    client.print("Content-Length: ");

    // calculate the length of the sensor reading in bytes:
    int thisLength = thisData.length();
    client.println(thisLength);

    // last pieces of the HTTP PUT request:
    client.println("Content-Type: application/json; charset=utf-8");
    client.println("Connection: close");
    client.println();

    // here's the actual content of the PUT request:

    client.println(thisData);

  }
  else {
    // if you couldn't make a connection:
    Serial.println("connection failed");
    Serial.println();
    Serial.println("disconnecting.");
    client.stop();
  }
  // note the time that the connection was made or attempted:
  lastConnectionTime = millis();
}

int getLength(int someValue) {
  // there's at least one byte:
  int digits = 1;
  // continually divide the value by ten,
  // adding one to the digit count for each
  // time you divide, until you're at 0:
  int dividend = someValue / 10;
  while (dividend > 0) {
    dividend = dividend / 10;
    digits++;
  }
  // return the number of digits:
  return digits;
}

void printWifiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength:
  long rssi = WiFi.RSSI();
  Serial.print("signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
}


