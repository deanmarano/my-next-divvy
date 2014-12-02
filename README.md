# http://mynextdivvy.com/ Divvy Station Prediction

A machine learning approach to predicting that status of Divvy stations.

## Usage

This code is a combination of two parts - the data processing and the website.

### Data Processing

The data processing is done via a series of Node.js scripts.
Visit [their homepage](http://nodejs.org/) to install it.

Data is fetched using a cron job:

```crontab
0,15,30,45 * * * * /home/dean/divvy/script
```

and the script contents are:

```shell
curl https://www.divvybikes.com/stations/json/  -o "/home/dean/divvy/divvy-$(date +%Y-%m-%d--%H:%M).json"
```

#### Setup

Install node dependencies:

```
npm install
```

#### Scripts

The following scripts are used with no params. To run them:

```
node (name of script)
```

* `combine-into-stations.js` - Reads in all of
the files from the archive, writes all of the IDs to a file,
and sorts the data by station instead of by date. It also writes
a list of days to read in the weather data.

* `weather.js` - Using the `days.json` filled by the `combine-into-stations.js`
script to pull weather data for each point from the forecast.io API.

* `read-station.js` - Goes through a single stations
file, merges in the weather data for each point, and
counts instances of whether the station has bikes for
each variable, and stores them in a file in the website.
This significantly reduces the amount of data that has to be
loaded in the browser, and also speeds up computation.

* `read-station.js` - Goes through a single stations
file, merges in the weather data for each point, and
counts instances of whether the station has bikes for
each variable, and stores them in a file in the website.
This significantly reduces the amount of data that has to be
loaded in the browser, and also speeds up computation.

* `read-station-2.js` - Similar to `read-station.js`, however
this does predictions of how many bikes will be at a station.

### Site

The site is an Ember.js site. To run, you will need `ember-cli`.

```
npm install -g ember-cli bower
```

#### Setup

Install node and bower dependencies

```
npm install
bower install
```

#### Running the App

From there you can launch the app from the site folder using

```
ember server
```

The main Bayesian logic can be found in the controllers:

* `app/controllers/station.js`
* `app/controllers/station/multi.js`

The scripts need to be run prior to running the app to generate the data,
although some data is included as an example.
