# UK Coronavirus Data API
<img src="https://i.ibb.co/Jj2H6wT/logoc.png" width="50%">
A live COVID-19 data scraper API provide function with history, and confirmed cases geolocation

[Web Example](http://covid19uk.live/ "Web Example") <br>

## API LIST

1. Current Figure: https://coronauk.isjeff.com/ 
2. History: https://coronauk.isjeff.com/history_figures
3. Location center: https://coronauk.isjeff.com/locations

(Not Recommented for Front-End Use ↓) <br>
4. History(with regional data): https://coronauk.isjeff.com/history
<br>

## Getting Started

This sourcecode require very basic nodejs skill, or just use the example API.

1. install mysql database > create a 'corona' database > import 'sample.sql'
2. rename `conf_tmp.js` to `conf.js`, config mysql username and password
3. create config a mapbox API Token, or disable getLocation() and putLocation() in index.js. This is for getting geolocation center for map data, its kind of essential for doing data visualization.
4. install lastest nodejs and run
	`npm i`
	`npm run dev` or just `node index.js`
5. project will start at `http://localhost:8003`
6. Manually insert 2 row to `current` and `current_shadow` table, doesn't really matter what you filled in
7. you can find all router enterance point in index.js


## Importance
1. Due to the announcement channel and structure might constantly changing, new data update will put into current_shadow table waiting for admin approve. Admin need to `GET`: http://HOST/approve?token= with token in the first row (id=1) of your user table, to update to official current table.

2. Use `GET`: http://HOST/update?token= to manually update all data (you need to approve the new data as well)

3. The false data may cause chaos to the public, please be careful. 

4. As I am not a professional coder (I am a designer), I am welcome if anyone could help me make improvement. You can contact me through ISSUE page

5. If you are using this API, please be make sure data has cache and fault tolerance was considered. This is API is not completely reliable at all time.

## Powered By
Standard NodeJs + ExpressJs along with superagent, cheerio, axios, node-schedule. Detail is in: package.json. Admin page sourcecode are not available


## Contact
If you are using this API, please join this discussion board. Keep updated for any significant changes!! <br>
https://spectrum.chat/covid-19-uk-update
<br><br>
WeChat Group:<br>
<img src="https://i.ibb.co/TgSHxK5/IMG-7184.jpg" width="20%">

## Data Source

### Figure
1. UK GOV: https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public
2. Worldometers: https://www.worldometers.info/coronavirus/

### Regional Data
1. England: https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public
2. Scotland: https://www.gov.scot/coronavirus-covid-19/


