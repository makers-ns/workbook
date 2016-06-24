
bool wait;
void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  Serial3.begin(9600);
  delay(100);
  Serial3.println("ATE0");
  get_firmware();
  delay(1000);
  connect_wifi();
  delay(1000);
}

void loop() {
  // put your main code here, to run repeatedly:

  if (Serial.available()){
    Serial3.write(Serial.read());
  }
    while(Serial3.available()){
      char chars = Serial3.read();
      Serial.print(chars);    
    }
}

void get_firmware(){
  Serial3.println("AT+GMR");
  while (!Serial3.available());

  while(Serial3.available()){
      char chars = Serial3.read();
      Serial.print(chars);    
    }

}

void connect_wifi(){
  Serial3.println("AT+CWJAP=\"TP-LINK_MAKERS\",\"MAKERS-NS\"");
  while (!Serial3.available());

  while(Serial3.available()){
      char chars = Serial3.read();
      Serial.print(chars);    
    }
  
}

