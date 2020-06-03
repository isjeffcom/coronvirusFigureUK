# UK Coronavirus Data Tracker API
<img src="https://i.ibb.co/88y21MH/bbv.png" width="40%">
A live COVID-19 data scraper API provide function with current status, history, and confirmed cases geolocation

# Visualization
https://covid19uk.live/

## API LIST

Root URL has changed to `https://api.covid19uk.live`, previous URL no longer accessible.

1. Current Figure: https://api.covid19uk.live/ 
2. History: https://api.covid19uk.live/historyfigures
3. Location center: https://api.covid19uk.live/locations
4. Gov.uk Update time daily: https://api.covid19uk.live/timeline

(Not for Front-End Use ↓) <br>
5. Full History(with regional): http://api.covid19uk.live/history
<br>

### About Data
1. People in hospital data was updated manually in every 2-4 days.
2. Wales regional data was updated mannually in every 2-4 days.

(This is due to the format or link from data source was constantly changing and manual intervention was often needed)

### API USAGE NOTICE
There are no access barriers for this public API. Only: <br>

<b>PLEASE</b> do not attack or harm this server as its not for profit, it's for people to obtain and understand information<br> 
<b>PLEASE</b> be careful when you testing this API in your product<br> 
<b>PLEASE</b> make sure you have cached data on your side as the server is not 24/7 stable<br>

No CORS, request limit applied. 

## Getting Started

Runtime require `NodeJs`

1. install mysql database > create a 'corona' database > import 'sample.sql'
2. rename `conf_tmp.js` to `conf.js`, config mysql username and password
3. create config a mapbox API Token, or disable getLocation() and putLocation() in index.js. This is for getting geolocation center for map data, its kind of essential for doing data visualization.
4. install lastest nodejs and run
	`npm i`
	`npm run dev` or just `node index.js`
5. project will start at `http://localhost:8003`
6. you can find all router enterance point in index.js


## Importance
1. Due to the announcement channel and structure are constantly changing, new data update will put into current_shadow table waiting for admin approve. Admin need to `GET`: http://HOST/approve?token= with token in the first row (id=1) of your user table, to update to official current table.

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
<br><br>

New Zealand Version (By @Larry):<br>
https://covid19nz.live


# Contact
If you are using this API, please join this discussion board. Keep updated for any significant changes!! <br>
https://www.facebook.com/groups/2944338405655888

<br><br>
WeChat Group:<br>
<img src="https://i.ibb.co/nBLCKVH/qr.jpg" width="30%">

https://isjeff.com
hello@isjeff.com

### Co-work with:
@Big Tree: https://github.com/lamharrison <br>
@Jimmy Lu: https://github.com/lujiammy <br>
@Vincent Zhang: https://github.com/VincentNevermore <br>
@commathree: https://github.com/commmathree <br>


## Data References

<li data-v-47d7a253=""><a data-v-47d7a253="" href="https://github.com/isjeffcom/coronvirusFigureUK" target="_blank">[API] Coronvirus Figure UK - isjeffcom</a></li>
<li data-v-47d7a253=""><a data-v-47d7a253="" href="https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public" target="_blank">[Gov]COVID-19: latest information and advice</a></li>
<li data-v-47d7a253=""><a data-v-47d7a253="" href="https://www.gov.uk/government/publications/covid-19-track-coronavirus-cases" target="_blank">[Gov]COVID-19: track coronavirus cases</a></li>
<li data-v-47d7a253=""><a data-v-47d7a253="" href="https://www.gov.scot/publications/coronavirus-covid-19-tests-and-cases-in-scotland/" target="_blank">[[Gov]Coronavirus in Scotland</a></li>
<li data-v-47d7a253=""><a data-v-47d7a253="" href="https://www.publichealth.hscni.net/news/covid-19-coronavirus" target="_blank">[Gov]COVID-19 (coronavirus) Northern Ireland</a></li>
<li data-v-47d7a253=""><a data-v-47d7a253="" href="https://gov.wales/written-statement-coronavirus-covid-19-1" target="_blank">[Gov]Written Statement: COVID-19 Wales</a></li>
<li data-v-47d7a253=""><a data-v-47d7a253="" href="https://twitter.com/DHSCgovuk" target="_blank">[Gov]DHSCgovuk Official Twitter</a></li>
<li data-v-47d7a253=""><a data-v-47d7a253="" href="https://www.worldometers.info/coronavirus/" target="_blank">[Media]COVID-19 CORONAVIRUS OUTBREAK (Worldometers)</a></li></div>