# Hemnet.se
We all know how dificult it is to find a home in Sweden.  
This scraper will help you to keep track of new homes by sending you a periodic newsletter.
You can specify the search criteria as you'd normaly do in hemnet.se website.

1) First you should install MySQL in your machine and create necessary table
```
CREATE TABLE `apartments` (
  `id` int(11) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `size` int(11) DEFAULT NULL,
  `rooms` int(11) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

2) Install necessary packages
```
npm install
```

3) Edit environment variables
```
cp example.env .env
```

4) Schedule task to run every hour
```
0 * * * * node folder/to/project/hemnet/main.js
```
