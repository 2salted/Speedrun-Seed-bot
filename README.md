
```bash
sudo apt update
sudo apt install openjdk-17-jre-headless
sudo apt install unzip
curl -fsSL https://bun.sh/install | bash


git clone https://github.com/2salted/Speedrun-Seed-bot.git
cd Speedrun-Seed-bot


mkdir minecraft
cd minecraft
wget https://launcher.mojang.com/v1/objects/a412fd69db1f81db3f511c1463fd304675244077/server.jar
echo "eula=true" > eula.txt
cd ..
bun i
bun src/findSeeds.ts
```


To run minecraft manually 
```bash
java -Xms1G -Xmx2G -jar server.jar nogui
```