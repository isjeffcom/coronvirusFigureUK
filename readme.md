# UK Coronavirus Data API
![](https://i.ibb.co/Jj2H6wT/logoc.png)
A live COVID-19 data scraper API provide function with history, and confirmed cases geolocation

[API Figure](http://coronauk.isjeff.com/ "API Figure") <br>
[API History](http://coronauk.isjeff.com/history "API History") <br>
[API Geolocation](http://coronauk.isjeff.com/locations "API Geolocation") <br>
[Data Example](http://coronauk.isjeff.com/visual "Data Example") <br>

## Getting Started

This sourcecode require very basic nodejs skill, or just use the example API.

1. install mysql database > create a 'corona' database > import 'sample.sql'
2. rename `conf_tmp.js` to `conf.js`, config mysql username and password
3. create config a mapbox API Token, or disable getLocation() and putLocation() in index.js. This is for getting geolocation center for map data, its kind of essential for doing data visualization.
3. install lastest nodejs and run
	`npm i`
	`npm run dev` or just `node index.js`
4. project will start at `http://localhost:8003`
5. you can find all router enterance point in index.js


## Data Visualization Source code
[covid-19-datav](https://github.com/isjeffcom/covid-19-datav-uk "covid-19-datav")


## Importance
1. Due to the announcement channel and structure might constantly changing, new data update will put into current_shadow table waiting for admin approve. Admin need to use link: http://HOST/approve?token= with token in the first row (id=1) of your user table, to update to official current table.

2. The false data may cause chaos to the public, please be careful. 

3. As I am not a professional coder (I am a designer), I am welcome if anyone could help me make improvement. You can contact me through ISSUE page

## Powered By
Standard NodeJs + ExpressJs along with superagent, cheerio, node-schedule. Detail is in: package.json.

## Data Source

### Figure
UK GOV: https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public
Worldometers: https://www.worldometers.info/coronavirus/

### Area Data
England: https://www.gov.uk/guidance/coronavirus-covid-19-information-for-the-public
Scotland: https://www.gov.scot/coronavirus-covid-19/


