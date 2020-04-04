# UK Coronavirus Data API
<img src="https://i.ibb.co/88y21MH/bbv.png" width="40%">
A live COVID-19 data scraper API provide function with history, and confirmed cases geolocation

# Visualization
https://covid19uk.live/

## API LIST

Root URL has changed to `https://api.covid19uk.live`, previous URL no longer accessible.

1. Current Figure: https://api.covid19uk.live/ 
2. History: https://api.covid19uk.live/historyfigures
3. Location center: https://api.covid19uk.live/locations

(Not Recommented for Front-End Use ↓) <br>
4. History(with regional data): http://api.covid19uk.live/history
<br>

Public API has request limit. 

### API USAGE NOTICE
There are not much access barriers for this public API. The only thing I ask for is: <br>

<b>PLEASE</b> do not attack or harm the server as this is not build for profit, it's for people to obtain and understand information<br> 
<b>PLEASE</b> be careful when you testing this API in your product as it could be potentially create damage<br> 
<b>PLEASE</b> make sure you have cached data on your side if you are building a product to customer as this API is not guaranteed 24/7 stable.<br>

## Getting Started

This sourcecode require very basic NodeJs skill, or just use the example API.

1. install mysql database > create a 'corona' database > import 'sample.sql'
2. rename `conf_tmp.js` to `conf.js`, config mysql username and password
3. create config a mapbox API Token, or disable getLocation() and putLocation() in index.js. This is for getting geolocation center for map data, its kind of essential for doing data visualization.
4. install lastest nodejs and run
	`npm i`
	`npm run dev` or just `node index.js`
5. project will start at `http://localhost:8003`
6. you can find all router enterance point in index.js


## Importance
1. Due to the announcement channel and structure might constantly changing, new data update will put into current_shadow table waiting for admin approve. Admin need to `GET`: http://HOST/approve?token= with token in the first row (id=1) of your user table, to update to official current table.

2. Use `GET`: http://HOST/update?token= to manually update all data (you need to approve the new data as well)

3. The false data may cause chaos to the public, please be careful. 

4. As I am not a professional coder (I am a designer), I am welcome if anyone could help me make improvement. You can contact me through ISSUE page

5. If you are using this API, please be make sure data has cache and fault tolerance was considered. This is API is not completely reliable at all time.

# Partnered Projects
UK API: https://github.com/isjeffcom/coronvirusFigureUK <br>
Global API: https://github.com/isjeffcom/coronavirusDataGlobal <br>
<br>
ML Prediction: https://github.com/lamharrison/coronavirus-machine-learning <br>
<br>
Store stock: <br>
https://github.com/commmathree/UKSupermarketScrapper <br>
https://github.com/isjeffcom/UK-All-Store <br>
<br>


# Contact
If you are using this API, please join this discussion board. Keep updated for any significant changes!! <br>
https://spectrum.chat/covid-19-uk-update
<br><br>
WeChat Group:<br>
<img src="https://i.ibb.co/WtrbwVY/nn.jpg" width="20%">

https://isjeff.com
hello@isjeff.com

### Co-work with:
@Big Tree: https://github.com/lamharrison <br>
@Jimmy Lu: https://github.com/lujiammy <br>
@Vincent: https://github.com/VincentNevermore <br>
@commathree: https://github.com/commmathree <br>


## Data Source

### Figure
1. UK GOV: https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public
2. Worldometers: https://www.worldometers.info/coronavirus/

### Regional Data
1. England: https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public
2. Scotland: https://www.gov.scot/coronavirus-covid-19/


