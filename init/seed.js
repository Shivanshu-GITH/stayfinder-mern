require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose   = require("mongoose");
const axios      = require("axios");
const cloudinary = require("cloudinary").v2;

const Listing = require("../models/listing");
const User    = require("../models/user");

cloudinary.config({
  cloud_name : process.env.CLOUD_NAME,
  api_key    : process.env.API_KEY,
  api_secret : process.env.API_SECRET,
});

const MONGO_URL = process.env.MONGO_URL;

async function getCoordinates(location) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
    const res = await axios.get(url, { headers: { "User-Agent": "stayfinder-seed" } });
    if (!res.data.length) return null;
    return { lat: parseFloat(res.data[0].lat), lon: parseFloat(res.data[0].lon) };
  } catch { return null; }
}

async function uploadToCloudinary(imageUrl) {
  try {
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: "stayfinder_images",
      transformation: [{ width: 1200, height: 800, crop: "fill", quality: "auto" }],
    });
    return { url: result.secure_url, filename: result.public_id };
  } catch (err) {
    console.warn("  ⚠ Upload failed:", err.message);
    return { url: imageUrl, filename: "stayfinder_images/placeholder" };
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── USERS ──────────────────────────────────────────────────
const USERS = [
  { username: "james_miller",       email: "james.miller@mail.com",       password: "Pass@1234" },
  { username: "jan_devries",        email: "jan.devries@mail.com",        password: "Pass@1234" },
  { username: "yuki_tanaka",        email: "yuki.tanaka@mail.com",        password: "Pass@1234" },
  { username: "aditya_sharma",      email: "aditya.sharma@mail.com",      password: "Pass@1234" },
  { username: "liam_wilson",        email: "liam.wilson@mail.com",        password: "Pass@1234" },
  { username: "oliver_smith",       email: "oliver.smith@mail.com",       password: "Pass@1234" },
  { username: "nikos_papadopoulos", email: "nikos.papa@mail.com",         password: "Pass@1234" },
  { username: "budi_santoso",       email: "budi.santoso@mail.com",       password: "Pass@1234" },
  { username: "marco_rossi",        email: "marco.rossi@mail.com",        password: "Pass@1234" },
  { username: "carlos_garcia",      email: "carlos.garcia@mail.com",      password: "Pass@1234" },
  { username: "pierre_dupont",      email: "pierre.dupont@mail.com",      password: "Pass@1234" },
  { username: "khalid_almazrouei",  email: "khalid.alm@mail.com",         password: "Pass@1234" },
  { username: "ahmed_shareef",      email: "ahmed.shareef@mail.com",      password: "Pass@1234" },
  { username: "jan_novak",          email: "jan.novak@mail.com",          password: "Pass@1234" },
  { username: "somchai_jaidee",     email: "somchai.jaidee@mail.com",     password: "Pass@1234" },
  { username: "youssef_benali",     email: "youssef.benali@mail.com",     password: "Pass@1234" },
  { username: "piotr_kowalski",     email: "piotr.kowalski@mail.com",     password: "Pass@1234" },
  { username: "bikram_thapa",       email: "bikram.thapa@mail.com",       password: "Pass@1234" },
  { username: "teiva_maono",        email: "teiva.maono@mail.com",        password: "Pass@1234" },
  { username: "rene_lafortune",     email: "rene.lafortune@mail.com",     password: "Pass@1234" },
  { username: "brian_otieno",       email: "brian.otieno@mail.com",       password: "Pass@1234" },
  { username: "julius_mwamba",      email: "julius.mwamba@mail.com",      password: "Pass@1234" },
  { username: "james_wilson",       email: "james.wilson@mail.com",       password: "Pass@1234" },
  { username: "hans_mueller",       email: "hans.mueller@mail.com",       password: "Pass@1234" },
  { username: "ethan_macdonald",    email: "ethan.macdonald@mail.com",    password: "Pass@1234" },
  { username: "mikko_virtanen",     email: "mikko.virtanen@mail.com",     password: "Pass@1234" },
  { username: "martin_gonzalez",    email: "martin.gonzalez@mail.com",    password: "Pass@1234" },
  { username: "erik_hansen",        email: "erik.hansen@mail.com",        password: "Pass@1234" },
  { username: "sean_murphy",        email: "sean.murphy@mail.com",        password: "Pass@1234" },
  { username: "sigurdur_jonsson",   email: "sigurdur.jonsson@mail.com",   password: "Pass@1234" },
];

// ── LISTINGS ────────────────────────────────────────────────
// [title, category, geocode_query, display_location, country, priceINR, host, [5 unsplash photo IDs]]
const LISTINGS_RAW = [
  // APARTMENT
  ["Skyline Studio in Manhattan", "Apartment",
    "Manhattan, New York, USA",
    "350 5th Avenue, Midtown Manhattan, New York City, USA", "USA", 18260, "james_miller",
    ["photo-1555636222-cae831e670b3","photo-1486325212027-8081e485255e","photo-1502672260266-1c1ef2d93688","photo-1560448204-e02f11c3d0e2","photo-1522708323590-d24dbb6b0267"]],

  ["Canal View Flat", "Apartment",
    "Amsterdam, Netherlands",
    "Prinsengracht 263, Jordaan, Amsterdam, Netherlands", "Netherlands", 14940, "jan_devries",
    ["photo-1512470876302-972faa2aa9a4","photo-1534351590666-13e3e96b5017","photo-1584467541268-b040f83be3fd","photo-1600596542815-ffad4c1539a9","photo-1600607687939-ce8a6c25118c"]],

  ["Shibuya Modern Studio", "Apartment",
    "Shibuya, Tokyo, Japan",
    "2-1 Dogenzaka, Shibuya, Tokyo, Japan", "Japan", 11620, "yuki_tanaka",
    ["photo-1540959733332-eab4deabeeaf","photo-1536098561742-ca998e48cbcc","photo-1513407030348-c983a97b98d8","photo-1532289735301-3702492c64e1","photo-1493976040374-85c8e12f0c0e"]],

  ["Bandra Sea-Link View Apt", "Apartment",
    "Bandra West, Mumbai, India",
    "Carter Road, Bandra West, Mumbai, Maharashtra, India", "India", 7885, "aditya_sharma",
    ["photo-1567157577867-05ccb1388e66","photo-1596178065887-1198b6148b2b","photo-1574362848149-11496d93a7c7","photo-1616587226960-4a03badbe8bf","photo-1598928506311-c55ded91a20c"]],

  ["Koramangala Studio Flat", "Apartment",
    "Koramangala, Bangalore, India",
    "80 Feet Road, 4th Block, Koramangala, Bengaluru, Karnataka, India", "India", 4980, "aditya_sharma",
    ["photo-1522771739844-6a9f6d5f14af","photo-1560185007-cde436f6a4d0","photo-1484154218962-a197022b5858","photo-1556909114-f6e7ad7d3136","photo-1598928506311-c55ded91a20c"]],

  ["Sydney Harbour Studio", "Apartment",
    "The Rocks, Sydney, Australia",
    "3 Circular Quay West, The Rocks, Sydney, NSW, Australia", "Australia", 16600, "liam_wilson",
    ["photo-1506973035872-a4ec16b8e8d9","photo-1524820801657-fd59673fbb05","photo-1572375992501-4b0892d50c69","photo-1523428096881-5bd79d043006","photo-1591474200742-8e512e6f98f8"]],

  // HOUSE
  ["Victorian Townhouse", "House",
    "South Kensington, London, UK",
    "South Kensington, London, United Kingdom", "United Kingdom", 24900, "oliver_smith",
    ["photo-1601918774516-f7f3d36a5a83","photo-1518780664697-55e3ad937233","photo-1523217582562-09d0def993a6","photo-1558618666-fcd25c85cd64","photo-1570129477492-45c003edd2be"]],

  ["Santorini Whitewashed House", "House",
    "Oia, Santorini, Greece",
    "Oia, Santorini, South Aegean, Greece", "Greece", 21580, "nikos_papadopoulos",
    ["photo-1570077188670-e3a8d69ac5ff","photo-1533105079780-92b9be482077","photo-1496442226666-8d4d0e62e6e9","photo-1613395877344-13d4a8e0d49e","photo-1602088113235-229c19758e9f"]],

  ["Kyoto Machiya Townhouse", "House",
    "Gion, Kyoto, Japan",
    "Gion, Higashiyama, Kyoto, Japan", "Japan", 18260, "yuki_tanaka",
    ["photo-1528360983277-13d401cdc186","photo-1493976040374-85c8e12f0c0e","photo-1545569341-9eb8b30979d9","photo-1578469645742-46cae010e5d4","photo-1524413840807-0c3cb6fa808d"]],

  ["Chettinad Heritage Mansion", "House",
    "Karaikudi, Tamil Nadu, India",
    "Kanadukathan, Karaikudi, Tamil Nadu, India", "India", 9130, "aditya_sharma",
    ["photo-1585546938369-73f80f4a8512","photo-1590080875515-8a3a8dc5735e","photo-1600607688969-a5bfcd646154","photo-1583608205776-bfd35f0d9f83","photo-1598928636135-d146006ff4be"]],

  ["Old Goa Colonial House", "House",
    "Panaji, Goa, India",
    "Panaji, Old Goa, Goa, India", "India", 10790, "aditya_sharma",
    ["photo-1590422749897-47726d0078af","photo-1598977745318-ae6ec31bc1ec","photo-1614849963640-9cc74b2a826f","photo-1600566752355-35792bedcfea","photo-1560185127-6ed189bf02f4"]],

  ["Barcelona Gothic Home", "House",
    "Gothic Quarter, Barcelona, Spain",
    "Gothic Quarter, Barcelona, Catalonia, Spain", "Spain", 19920, "carlos_garcia",
    ["photo-1539037116277-4db20889f2d4","photo-1583422409516-2895a77efded","photo-1568605114967-8130f3a36994","photo-1529516222410-9e73ea02c0dc","photo-1558618047-3c8c76ca7d13"]],

  // VILLA
  ["Infinity Pool Villa Bali", "Villa",
    "Kerobokan, Bali, Indonesia",
    "Jalan Umalas, Kerobokan Kelod, Bali, Indonesia", "Indonesia", 29050, "budi_santoso",
    ["photo-1537996194471-e657df975ab4","photo-1518548419970-58e3b4079ab2","photo-1573843981267-be1999ff37cd","photo-1552733407-5d5c46c3bb3b","photo-1540541338537-1d4d9741571f"]],

  ["Mykonos Cliffside Villa", "Villa",
    "Mykonos, Greece",
    "Mykonos Town, Mykonos, South Aegean, Greece", "Greece", 49800, "nikos_papadopoulos",
    ["photo-1601758174114-e711b89d7c60","photo-1555881400-74d7acaacd8b","photo-1613395877344-13d4a8e0d49e","photo-1570077188670-e3a8d69ac5ff","photo-1612686635542-2244ed9f8ddc"]],

  ["Amalfi Coast Retreat Villa", "Villa",
    "Positano, Amalfi, Italy",
    "Positano, Amalfi Coast, Salerno, Italy", "Italy", 53950, "marco_rossi",
    ["photo-1533587851505-d119e13fa0d7","photo-1516483638261-f4dbaf036963","photo-1523531294919-4bcd7c65e216","photo-1534430480872-3498386e7856","photo-1498307833174-477cf4c7e5ca"]],

  ["Goa Portuguese Villa", "Villa",
    "Assagao, North Goa, India",
    "Assagao, North Goa, Goa, India", "India", 16600, "aditya_sharma",
    ["photo-1590422749897-47726d0078af","photo-1560185127-6ed189bf02f4","photo-1598977745318-ae6ec31bc1ec","photo-1571003123894-1f0594d2b5d9","photo-1567538096630-e0c55bd6374c"]],

  ["Udaipur Lake-View Villa", "Villa",
    "Udaipur, Rajasthan, India",
    "Lake Pichola, Udaipur, Rajasthan, India", "India", 20750, "aditya_sharma",
    ["photo-1599661046289-e31897846e41","photo-1524492412937-b28074a5d7da","photo-1545126994-46f1c34bf94f","photo-1561361058-c12e14ce7a66","photo-1605649487212-47bdab064df7"]],

  ["Marbella Beachside Villa", "Villa",
    "Marbella, Andalusia, Spain",
    "Marbella, Andalusia, Spain", "Spain", 45650, "carlos_garcia",
    ["photo-1512917774080-9991f1c4c750","photo-1598928506311-c55ded91a20c","photo-1582268611958-ebfd161ef9cf","photo-1571896349842-33c89424de2d","photo-1584622650111-993a426fbf0a"]],

  // HOTEL
  ["Ritz-Style Boutique Hotel", "Hotel",
    "Place Vendome, Paris, France",
    "Place Vendôme, 1st Arrondissement, Paris, France", "France", 37350, "pierre_dupont",
    ["photo-1566073771259-6a8506099945","photo-1551882547-ff40c63fe5fa","photo-1564501049412-61c2a3083791","photo-1578683010236-d716f9a3f461","photo-1542314831-068cd1dbfeeb"]],

  ["Desert Palace Hotel", "Hotel",
    "Jumeirah, Dubai, UAE",
    "Jumeirah Beach Road, Dubai, UAE", "UAE", 58100, "khalid_almazrouei",
    ["photo-1512453979798-5ea266f8880c","photo-1582719508461-905c673771fd","photo-1615460549969-36fa19521a4f","photo-1590073844006-33379778ae09","photo-1529290130-4ca3753253ae"]],

  ["Maldives Water Bungalow", "Hotel",
    "North Male Atoll, Maldives",
    "North Malé Atoll, Maldives", "Maldives", 74700, "ahmed_shareef",
    ["photo-1514282401047-d79a71a590e8","photo-1573843981267-be1999ff37cd","photo-1544551763-46a013bb70d5","photo-1540202404-d0c7fe46a087","photo-1510414842594-a61c69b5ae57"]],

  ["Taj Falaknuma Palace", "Hotel",
    "Hyderabad, Telangana, India",
    "Falaknuma, Hyderabad, Telangana, India", "India", 31540, "aditya_sharma",
    ["photo-1524492412937-b28074a5d7da","photo-1599661046289-e31897846e41","photo-1545126994-46f1c34bf94f","photo-1561361058-c12e14ce7a66","photo-1563911302283-d2bc129e7570"]],

  ["Oberoi Amarvilas", "Hotel",
    "Agra, Uttar Pradesh, India",
    "Taj East Gate Road, Agra, Uttar Pradesh, India", "India", 34860, "aditya_sharma",
    ["photo-1548013146-72479768bada","photo-1524492412937-b28074a5d7da","photo-1599661046289-e31897846e41","photo-1561361058-c12e14ce7a66","photo-1517760444937-f6397edcbbcd"]],

  ["Art Nouveau Grand Hotel", "Hotel",
    "Prague, Czech Republic",
    "Václavské náměstí, Nové Město, Prague, Czech Republic", "Czech Republic", 14940, "jan_novak",
    ["photo-1541849546-216549ae216d","photo-1592861956120-e524fc739696","photo-1519677100203-a0e668c92439","photo-1555881400-74d7acaacd8b","photo-1564501049412-61c2a3083791"]],

  // HOSTEL
  ["Backpacker Central Hostel", "Hostel",
    "Khao San Road, Bangkok, Thailand",
    "Khao San Road, Banglamphu, Bangkok, Thailand", "Thailand", 1245, "somchai_jaidee",
    ["photo-1555400038-63f5ba517a47","photo-1520250497591-112f2f40a3f4","photo-1582719478250-c89cae4dc85b","photo-1571896349842-33c89424de2d","photo-1504280390367-361c6d9f38f4"]],

  ["Medina Riad Hostel", "Hostel",
    "Medina, Marrakech, Morocco",
    "Medina, Marrakech, Morocco", "Morocco", 2075, "youssef_benali",
    ["photo-1539020140153-e479b8c22e70","photo-1575891675218-27f37d22dc93","photo-1548438294-1ad5d5f4f063","photo-1516483638261-f4dbaf036963","photo-1489493512598-d08130f49bea"]],

  ["Zostel Rishikesh", "Hostel",
    "Rishikesh, Uttarakhand, India",
    "Tapovan, Rishikesh, Uttarakhand, India", "India", 1494, "aditya_sharma",
    ["photo-1506905925346-21bda4d32df4","photo-1558618047-3c8c76ca7d13","photo-1571115764595-644a1f56a55c","photo-1585546938369-73f80f4a8512","photo-1617839625591-e5a789593135"]],

  ["Zostel Mcleod Ganj", "Hostel",
    "McLeod Ganj, Dharamshala, Himachal Pradesh, India",
    "McLeod Ganj, Dharamshala, Himachal Pradesh, India", "India", 1245, "aditya_sharma",
    ["photo-1477346611705-65d1883cee1e","photo-1464822759023-fed622ff2c3b","photo-1506905925346-21bda4d32df4","photo-1571115764595-644a1f56a55c","photo-1519681393784-d120267933ba"]],

  ["Old Town Party Hostel", "Hostel",
    "Old Town, Krakow, Poland",
    "Floriańska Street, Old Town, Krakow, Poland", "Poland", 1660, "piotr_kowalski",
    ["photo-1519677100203-a0e668c92439","photo-1541849546-216549ae216d","photo-1504280390367-361c6d9f38f4","photo-1555881400-74d7acaacd8b","photo-1592861956120-e524fc739696"]],

  ["Kathmandu Valley Hostel", "Hostel",
    "Thamel, Kathmandu, Nepal",
    "Thamel, Kathmandu, Nepal", "Nepal", 996, "bikram_thapa",
    ["photo-1605649487212-47bdab064df7","photo-1477346611705-65d1883cee1e","photo-1506905925346-21bda4d32df4","photo-1464822759023-fed622ff2c3b","photo-1519681393784-d120267933ba"]],

  // RESORT
  ["Overwater Paradise Resort", "Resort",
    "Bora Bora, French Polynesia",
    "Bora Bora, Society Islands, French Polynesia", "French Polynesia", 99600, "teiva_maono",
    ["photo-1510414842594-a61c69b5ae57","photo-1514282401047-d79a71a590e8","photo-1573843981267-be1999ff37cd","photo-1544551763-46a013bb70d5","photo-1540202404-d0c7fe46a087"]],

  ["Seychelles Eco Resort", "Resort",
    "Beau Vallon, Mahe, Seychelles",
    "Beau Vallon, Mahé, Seychelles", "Seychelles", 66400, "rene_lafortune",
    ["photo-1590523277543-a94d2e4eb00b","photo-1559827291-72416316b8c3","photo-1504870712357-65ea720d6078","photo-1540202404-d0c7fe46a087","photo-1510414842594-a61c69b5ae57"]],

  ["Anantara Desert Resort", "Resort",
    "Abu Dhabi, UAE",
    "Al Wathba, Abu Dhabi, UAE", "UAE", 49800, "khalid_almazrouei",
    ["photo-1512453979798-5ea266f8880c","photo-1582719508461-905c673771fd","photo-1529290130-4ca3753253ae","photo-1590073844006-33379778ae09","photo-1615460549969-36fa19521a4f"]],

  ["Wildflower Hall Shimla", "Resort",
    "Mashobra, Shimla, Himachal Pradesh, India",
    "Mashobra, Shimla, Himachal Pradesh, India", "India", 24900, "aditya_sharma",
    ["photo-1477346611705-65d1883cee1e","photo-1519681393784-d120267933ba","photo-1464822759023-fed622ff2c3b","photo-1506905925346-21bda4d32df4","photo-1476514525535-07fb3b4ae5f1"]],

  ["Spice Village Thekkady", "Resort",
    "Thekkady, Kerala, India",
    "Kumily, Thekkady, Idukki, Kerala, India", "India", 14940, "aditya_sharma",
    ["photo-1558618047-3c8c76ca7d13","photo-1571115764595-644a1f56a55c","photo-1549880338-65ddcdfd017b","photo-1504280390367-361c6d9f38f4","photo-1606791405792-1004f1718d0c"]],

  ["Masai Mara Safari Resort", "Resort",
    "Masai Mara, Kenya",
    "Masai Mara National Reserve, Narok, Kenya", "Kenya", 62250, "brian_otieno",
    ["photo-1516426122078-c23e76319801","photo-1547036967-23d11aacaee0","photo-1551632436-cbf8dd35adfa","photo-1504173010664-32509aeebb62","photo-1607923432780-7a9c30adcb73"]],

  // COTTAGE
  ["Cotswolds Stone Cottage", "Cottage",
    "Bourton-on-the-Water, Cotswolds, England",
    "Bourton-on-the-Water, Cotswolds, Gloucestershire, UK", "United Kingdom", 14940, "oliver_smith",
    ["photo-1600585154340-be6161a56a0c","photo-1568605114967-8130f3a36994","photo-1558618666-fcd25c85cd64","photo-1523217582562-09d0def993a6","photo-1601918774516-f7f3d36a5a83"]],

  ["Provençal Country Cottage", "Cottage",
    "Gordes, Vaucluse, Provence, France",
    "Gordes, Luberon, Vaucluse, France", "France", 16600, "pierre_dupont",
    ["photo-1499793983690-e29da59ef1c2","photo-1568605114967-8130f3a36994","photo-1558618666-fcd25c85cd64","photo-1572375992501-4b0892d50c69","photo-1600585154340-be6161a56a0c"]],

  ["Cape Cod Seaside Cottage", "Cottage",
    "Provincetown, Cape Cod, Massachusetts, USA",
    "Provincetown, Cape Cod, Massachusetts, USA", "USA", 18260, "james_miller",
    ["photo-1499793983690-e29da59ef1c2","photo-1505118380757-91f5f5632de0","photo-1600585154340-be6161a56a0c","photo-1558618666-fcd25c85cd64","photo-1487958449943-2429e8be8625"]],

  ["Coorg Coffee Cottage", "Cottage",
    "Madikeri, Coorg, Karnataka, India",
    "Madikeri, Kodagu, Karnataka, India", "India", 7055, "aditya_sharma",
    ["photo-1558618047-3c8c76ca7d13","photo-1549880338-65ddcdfd017b","photo-1571115764595-644a1f56a55c","photo-1504280390367-361c6d9f38f4","photo-1606791405792-1004f1718d0c"]],

  ["Munnar Tea Estate Cottage", "Cottage",
    "Munnar, Kerala, India",
    "Munnar, Idukki, Kerala, India", "India", 7470, "aditya_sharma",
    ["photo-1617839625591-e5a789593135","photo-1558618047-3c8c76ca7d13","photo-1571115764595-644a1f56a55c","photo-1549880338-65ddcdfd017b","photo-1606791405792-1004f1718d0c"]],

  ["Irish Cliffside Cottage", "Cottage",
    "Dingle, County Kerry, Ireland",
    "Dingle Peninsula, County Kerry, Ireland", "Ireland", 14110, "sean_murphy",
    ["photo-1504280390367-361c6d9f38f4","photo-1499793983690-e29da59ef1c2","photo-1558618666-fcd25c85cd64","photo-1600585154340-be6161a56a0c","photo-1505118380757-91f5f5632de0"]],

  // CABIN
  ["Norwegian Fjord Cabin", "Cabin",
    "Gudvangen, Aurland, Norway",
    "Gudvangen, Aurland, Vestland, Norway", "Norway", 20750, "erik_hansen",
    ["photo-1476514525535-07fb3b4ae5f1","photo-1464822759023-fed622ff2c3b","photo-1506905925346-21bda4d32df4","photo-1519681393784-d120267933ba","photo-1472214103451-9374bd1c798e"]],

  ["Lapland Aurora Cabin", "Cabin",
    "Rovaniemi, Lapland, Finland",
    "Rovaniemi, Lapland, Finland", "Finland", 24900, "mikko_virtanen",
    ["photo-1531366936337-7c912a4589a7","photo-1478265409525-aaeb37a8c9b7","photo-1473580044384-7ba9967e16a0","photo-1491555103944-7c647fd857e6","photo-1519681393784-d120267933ba"]],

  ["Banff Rocky Mountain Cabin", "Cabin",
    "Banff, Alberta, Canada",
    "Banff, Alberta, Canada", "Canada", 18260, "ethan_macdonald",
    ["photo-1441974231531-c6227db76b6e","photo-1464822759023-fed622ff2c3b","photo-1476514525535-07fb3b4ae5f1","photo-1472214103451-9374bd1c798e","photo-1506905925346-21bda4d32df4"]],

  ["Chopta Himalayan Cabin", "Cabin",
    "Chopta, Rudraprayag, Uttarakhand, India",
    "Chopta, Rudraprayag, Uttarakhand, India", "India", 4565, "aditya_sharma",
    ["photo-1506905925346-21bda4d32df4","photo-1477346611705-65d1883cee1e","photo-1464822759023-fed622ff2c3b","photo-1519681393784-d120267933ba","photo-1476514525535-07fb3b4ae5f1"]],

  ["Kasol Pine Cabin", "Cabin",
    "Kasol, Kullu, Himachal Pradesh, India",
    "Kasol, Parvati Valley, Kullu, Himachal Pradesh, India", "India", 3735, "aditya_sharma",
    ["photo-1464822759023-fed622ff2c3b","photo-1477346611705-65d1883cee1e","photo-1506905925346-21bda4d32df4","photo-1441974231531-c6227db76b6e","photo-1476514525535-07fb3b4ae5f1"]],

  ["Montana Pine Forest Cabin", "Cabin",
    "Glacier National Park, Montana, USA",
    "Glacier National Park, Montana, USA", "USA", 12450, "james_miller",
    ["photo-1441974231531-c6227db76b6e","photo-1472214103451-9374bd1c798e","photo-1476514525535-07fb3b4ae5f1","photo-1464822759023-fed622ff2c3b","photo-1506905925346-21bda4d32df4"]],

  // FARM STAY
  ["Tuscany Vineyard Farm", "Farm Stay",
    "Greve in Chianti, Tuscany, Italy",
    "Greve in Chianti, Siena, Tuscany, Italy", "Italy", 14940, "marco_rossi",
    ["photo-1464822759023-fed622ff2c3b","photo-1504280390367-361c6d9f38f4","photo-1523217582562-09d0def993a6","photo-1499793983690-e29da59ef1c2","photo-1568605114967-8130f3a36994"]],

  ["New Zealand Sheep Farm", "Farm Stay",
    "Arrowtown, Queenstown, New Zealand",
    "Arrowtown, Queenstown-Lakes, New Zealand", "New Zealand", 13280, "james_wilson",
    ["photo-1506905925346-21bda4d32df4","photo-1464822759023-fed622ff2c3b","photo-1441974231531-c6227db76b6e","photo-1476514525535-07fb3b4ae5f1","photo-1472214103451-9374bd1c798e"]],

  ["Kerala Spice Farm Stay", "Farm Stay",
    "Munnar, Kerala, India",
    "Anayirangal, Munnar, Kerala, India", "India", 6640, "aditya_sharma",
    ["photo-1558618047-3c8c76ca7d13","photo-1617839625591-e5a789593135","photo-1549880338-65ddcdfd017b","photo-1571115764595-644a1f56a55c","photo-1504280390367-361c6d9f38f4"]],

  ["Rajasthan Heritage Farm", "Farm Stay",
    "Jodhpur, Rajasthan, India",
    "Mandore, Jodhpur, Rajasthan, India", "India", 8300, "aditya_sharma",
    ["photo-1524492412937-b28074a5d7da","photo-1599661046289-e31897846e41","photo-1517760444937-f6397edcbbcd","photo-1561361058-c12e14ce7a66","photo-1563911302283-d2bc129e7570"]],

  ["Napa Valley Wine Farm", "Farm Stay",
    "Napa, California, USA",
    "Silverado Trail, Napa Valley, California, USA", "USA", 23240, "james_miller",
    ["photo-1464822759023-fed622ff2c3b","photo-1504280390367-361c6d9f38f4","photo-1499793983690-e29da59ef1c2","photo-1568605114967-8130f3a36994","photo-1523217582562-09d0def993a6"]],

  ["Provence Lavender Farm", "Farm Stay",
    "Gordes, Luberon, Vaucluse, France",
    "Gordes, Vaucluse, Provence, France", "France", 16600, "pierre_dupont",
    ["photo-1499793983690-e29da59ef1c2","photo-1504280390367-361c6d9f38f4","photo-1568605114967-8130f3a36994","photo-1558618666-fcd25c85cd64","photo-1600585154340-be6161a56a0c"]],

  // CAMPING
  ["Serengeti Tented Camp", "Camping",
    "Serengeti, Tanzania",
    "Serengeti National Park, Simiyu, Tanzania", "Tanzania", 29050, "julius_mwamba",
    ["photo-1516426122078-c23e76319801","photo-1547036967-23d11aacaee0","photo-1551632436-cbf8dd35adfa","photo-1504173010664-32509aeebb62","photo-1607923432780-7a9c30adcb73"]],

  ["Sahara Desert Camp", "Camping",
    "Merzouga, Morocco",
    "Erg Chebbi, Merzouga, Drâa-Tafilalet, Morocco", "Morocco", 12450, "youssef_benali",
    ["photo-1509316785289-025f5b846b35","photo-1539020140153-e479b8c22e70","photo-1575891675218-27f37d22dc93","photo-1548438294-1ad5d5f4f063","photo-1489493512598-d08130f49bea"]],

  ["Iceland Northern Lights Camp", "Camping",
    "Thingvellir, Iceland",
    "Þingvellir National Park, Iceland", "Iceland", 16600, "sigurdur_jonsson",
    ["photo-1531366936337-7c912a4589a7","photo-1478265409525-aaeb37a8c9b7","photo-1473580044384-7ba9967e16a0","photo-1491555103944-7c647fd857e6","photo-1531366936337-7c912a4589a7"]],

  ["Rajasthan Desert Camp", "Camping",
    "Jaisalmer, Rajasthan, India",
    "Sam Sand Dunes, Jaisalmer, Rajasthan, India", "India", 7470, "aditya_sharma",
    ["photo-1524492412937-b28074a5d7da","photo-1517760444937-f6397edcbbcd","photo-1599661046289-e31897846e41","photo-1563911302283-d2bc129e7570","photo-1561361058-c12e14ce7a66"]],

  ["Spiti Valley Camp", "Camping",
    "Kaza, Spiti, Himachal Pradesh, India",
    "Kaza, Spiti Valley, Himachal Pradesh, India", "India", 4980, "aditya_sharma",
    ["photo-1477346611705-65d1883cee1e","photo-1506905925346-21bda4d32df4","photo-1464822759023-fed622ff2c3b","photo-1519681393784-d120267933ba","photo-1476514525535-07fb3b4ae5f1"]],

  ["Torres del Paine Camp", "Camping",
    "Torres del Paine, Patagonia, Chile",
    "Torres del Paine National Park, Magallanes, Chile", "Chile", 14940, "martin_gonzalez",
    ["photo-1476514525535-07fb3b4ae5f1","photo-1464822759023-fed622ff2c3b","photo-1441974231531-c6227db76b6e","photo-1506905925346-21bda4d32df4","photo-1519681393784-d120267933ba"]],

  // LUXURY
  ["Burj Al Arab Suite", "Luxury",
    "Jumeirah, Dubai, UAE",
    "Jumeirah Beach Road, Jumeirah, Dubai, UAE", "UAE", 207500, "khalid_almazrouei",
    ["photo-1512453979798-5ea266f8880c","photo-1582719508461-905c673771fd","photo-1590073844006-33379778ae09","photo-1615460549969-36fa19521a4f","photo-1529290130-4ca3753253ae"]],

  ["Claridge's Presidential Suite", "Luxury",
    "Mayfair, London, UK",
    "Brook Street, Mayfair, London, United Kingdom", "United Kingdom", 249000, "oliver_smith",
    ["photo-1566073771259-6a8506099945","photo-1551882547-ff40c63fe5fa","photo-1564501049412-61c2a3083791","photo-1578683010236-d716f9a3f461","photo-1542314831-068cd1dbfeeb"]],

  ["Aman Tokyo Penthouse", "Luxury",
    "Otemachi, Tokyo, Japan",
    "Otemachi, Chiyoda, Tokyo, Japan", "Japan", 149400, "yuki_tanaka",
    ["photo-1540959733332-eab4deabeeaf","photo-1536098561742-ca998e48cbcc","photo-1513407030348-c983a97b98d8","photo-1532289735301-3702492c64e1","photo-1493976040374-85c8e12f0c0e"]],

  ["Taj Lake Palace Suite", "Luxury",
    "Lake Pichola, Udaipur, Rajasthan, India",
    "Lake Pichola, Udaipur, Rajasthan, India", "India", 66400, "aditya_sharma",
    ["photo-1599661046289-e31897846e41","photo-1524492412937-b28074a5d7da","photo-1545126994-46f1c34bf94f","photo-1561361058-c12e14ce7a66","photo-1605649487212-47bdab064df7"]],

  ["The Leela Palace Suite", "Luxury",
    "Chanakyapuri, New Delhi, India",
    "Diplomatic Enclave, Chanakyapuri, New Delhi, India", "India", 53950, "aditya_sharma",
    ["photo-1548013146-72479768bada","photo-1599661046289-e31897846e41","photo-1524492412937-b28074a5d7da","photo-1545126994-46f1c34bf94f","photo-1517760444937-f6397edcbbcd"]],

  ["Four Seasons Bali Suite", "Luxury",
    "Jimbaran, Bali, Indonesia",
    "Jimbaran Bay, Jimbaran, Bali, Indonesia", "Indonesia", 99600, "budi_santoso",
    ["photo-1537996194471-e657df975ab4","photo-1518548419970-58e3b4079ab2","photo-1573843981267-be1999ff37cd","photo-1552733407-5d5c46c3bb3b","photo-1540541338537-1d4d9741571f"]],

  // BEACHFRONT
  ["Maldives Sunset Bungalow", "Beachfront",
    "North Ari Atoll, Maldives",
    "North Ari Atoll, Maldives", "Maldives", 49800, "ahmed_shareef",
    ["photo-1514282401047-d79a71a590e8","photo-1573843981267-be1999ff37cd","photo-1544551763-46a013bb70d5","photo-1540202404-d0c7fe46a087","photo-1510414842594-a61c69b5ae57"]],

  ["Tulum Beach House", "Beachfront",
    "Tulum, Quintana Roo, Mexico",
    "Tulum, Quintana Roo, Mexico", "Mexico", 20750, "james_miller",
    ["photo-1505118380757-91f5f5632de0","photo-1504280390367-361c6d9f38f4","photo-1590523277543-a94d2e4eb00b","photo-1559827291-72416316b8c3","photo-1510414842594-a61c69b5ae57"]],

  ["Maui Oceanfront Cottage", "Beachfront",
    "Maui, Hawaii, USA",
    "Paia, Maui, Hawaii, USA", "USA", 29050, "james_miller",
    ["photo-1505118380757-91f5f5632de0","photo-1559827291-72416316b8c3","photo-1590523277543-a94d2e4eb00b","photo-1504870712357-65ea720d6078","photo-1510414842594-a61c69b5ae57"]],

  ["Radhanagar Beach House", "Beachfront",
    "Havelock Island, Andaman, India",
    "Havelock Island, Andaman and Nicobar Islands, India", "India", 11620, "aditya_sharma",
    ["photo-1590523277543-a94d2e4eb00b","photo-1559827291-72416316b8c3","photo-1505118380757-91f5f5632de0","photo-1504870712357-65ea720d6078","photo-1510414842594-a61c69b5ae57"]],

  ["Varkala Clifftop Stay", "Beachfront",
    "Varkala, Thiruvananthapuram, Kerala, India",
    "North Cliff, Varkala, Thiruvananthapuram, Kerala, India", "India", 6225, "aditya_sharma",
    ["photo-1617839625591-e5a789593135","photo-1558618047-3c8c76ca7d13","photo-1559827291-72416316b8c3","photo-1590523277543-a94d2e4eb00b","photo-1505118380757-91f5f5632de0"]],

  ["Koh Samui Shore Bungalow", "Beachfront",
    "Koh Samui, Surat Thani, Thailand",
    "Chaweng, Koh Samui, Surat Thani, Thailand", "Thailand", 14940, "somchai_jaidee",
    ["photo-1520250497591-112f2f40a3f4","photo-1505118380757-91f5f5632de0","photo-1559827291-72416316b8c3","photo-1590523277543-a94d2e4eb00b","photo-1510414842594-a61c69b5ae57"]],

  // MOUNTAIN VIEW
  ["Zermatt Matterhorn Chalet", "Mountain View",
    "Zermatt, Valais, Switzerland",
    "Zermatt, Visp, Valais, Switzerland", "Switzerland", 33200, "hans_mueller",
    ["photo-1477346611705-65d1883cee1e","photo-1506905925346-21bda4d32df4","photo-1519681393784-d120267933ba","photo-1464822759023-fed622ff2c3b","photo-1476514525535-07fb3b4ae5f1"]],

  ["Machu Picchu Lodge", "Mountain View",
    "Aguas Calientes, Cusco, Peru",
    "Aguas Calientes, Urubamba, Cusco, Peru", "Peru", 24900, "james_miller",
    ["photo-1464822759023-fed622ff2c3b","photo-1476514525535-07fb3b4ae5f1","photo-1477346611705-65d1883cee1e","photo-1441974231531-c6227db76b6e","photo-1506905925346-21bda4d32df4"]],

  ["Aspen Ski Chalet", "Mountain View",
    "Aspen, Colorado, USA",
    "Aspen, Pitkin County, Colorado, USA", "USA", 41500, "james_miller",
    ["photo-1476514525535-07fb3b4ae5f1","photo-1519681393784-d120267933ba","photo-1477346611705-65d1883cee1e","photo-1464822759023-fed622ff2c3b","photo-1506905925346-21bda4d32df4"]],

  ["Snow View Retreat Manali", "Mountain View",
    "Manali, Himachal Pradesh, India",
    "Old Manali, Manali, Himachal Pradesh, India", "India", 8300, "aditya_sharma",
    ["photo-1477346611705-65d1883cee1e","photo-1464822759023-fed622ff2c3b","photo-1506905925346-21bda4d32df4","photo-1519681393784-d120267933ba","photo-1476514525535-07fb3b4ae5f1"]],

  ["Leh Ladakh Himalaya Lodge", "Mountain View",
    "Leh, Ladakh, India",
    "Changspa, Leh, Ladakh, India", "India", 9960, "aditya_sharma",
    ["photo-1506905925346-21bda4d32df4","photo-1477346611705-65d1883cee1e","photo-1519681393784-d120267933ba","photo-1464822759023-fed622ff2c3b","photo-1476514525535-07fb3b4ae5f1"]],

  ["Mont Blanc Basecamp", "Mountain View",
    "Chamonix, Haute-Savoie, France",
    "Les Houches, Chamonix, Haute-Savoie, France", "France", 29050, "pierre_dupont",
    ["photo-1519681393784-d120267933ba","photo-1476514525535-07fb3b4ae5f1","photo-1477346611705-65d1883cee1e","photo-1464822759023-fed622ff2c3b","photo-1506905925346-21bda4d32df4"]],

  // CITY STAY
  ["Midtown Manhattan Loft", "City Stay",
    "Midtown, New York City, USA",
    "Midtown Manhattan, New York City, USA", "USA", 21580, "james_miller",
    ["photo-1555636222-cae831e670b3","photo-1486325212027-8081e485255e","photo-1502672260266-1c1ef2d93688","photo-1560448204-e02f11c3d0e2","photo-1522708323590-d24dbb6b0267"]],

  ["Shoreditch Artist Loft", "City Stay",
    "Shoreditch, London, UK",
    "Shoreditch, London Borough of Tower Hamlets, UK", "United Kingdom", 16600, "oliver_smith",
    ["photo-1601918774516-f7f3d36a5a83","photo-1518780664697-55e3ad937233","photo-1523217582562-09d0def993a6","photo-1558618666-fcd25c85cd64","photo-1570129477492-45c003edd2be"]],

  ["Le Marais Design Studio", "City Stay",
    "Le Marais, Paris, France",
    "Le Marais, 3rd Arrondissement, Paris, France", "France", 15770, "pierre_dupont",
    ["photo-1499793983690-e29da59ef1c2","photo-1542314831-068cd1dbfeeb","photo-1566073771259-6a8506099945","photo-1564501049412-61c2a3083791","photo-1578683010236-d716f9a3f461"]],

  ["Hauz Khas Village Loft", "City Stay",
    "Hauz Khas, New Delhi, India",
    "Hauz Khas Village, South Delhi, New Delhi, India", "India", 5810, "aditya_sharma",
    ["photo-1574362848149-11496d93a7c7","photo-1596178065887-1198b6148b2b","photo-1567157577867-05ccb1388e66","photo-1616587226960-4a03badbe8bf","photo-1598928506311-c55ded91a20c"]],

  ["Bandra West Chic Studio", "City Stay",
    "Bandra West, Mumbai, India",
    "Bandra West, Mumbai, Maharashtra, India", "India", 6640, "aditya_sharma",
    ["photo-1596178065887-1198b6148b2b","photo-1567157577867-05ccb1388e66","photo-1574362848149-11496d93a7c7","photo-1616587226960-4a03badbe8bf","photo-1598928506311-c55ded91a20c"]],

  ["Mitte Minimalist Studio", "City Stay",
    "Mitte, Berlin, Germany",
    "Unter den Linden, Mitte, Berlin, Germany", "Germany", 11620, "jan_novak",
    ["photo-1502672260266-1c1ef2d93688","photo-1560448204-e02f11c3d0e2","photo-1522708323590-d24dbb6b0267","photo-1555636222-cae831e670b3","photo-1486325212027-8081e485255e"]],
];

// ── MAIN ────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(MONGO_URL);
  console.log("\n✅ Connected to MongoDB\n");

  await Listing.deleteMany({});
  await User.deleteMany({});
  console.log("🗑  Cleared existing data\n");

  // Create users
  console.log("👤 Creating users...");
  const userMap = {};
  for (const u of USERS) {
    const doc = new User({ username: u.username, email: u.email });
    const reg = await User.register(doc, u.password);
    userMap[u.username] = reg;
    console.log(`   ✔ ${u.username}`);
  }
  console.log(`\n✅ ${USERS.length} users created\n`);

  // Insert listings
  console.log("🏠 Inserting listings...\n");
  let count = 0;

  for (let i = 0; i < LISTINGS_RAW.length; i++) {
    const [title, category, geocodeQuery, displayLocation, country, priceINR, hostUsername, photoIds] = LISTINGS_RAW[i];
    console.log(`[${i+1}/${LISTINGS_RAW.length}] ${title}`);

    // Geocode with simplified query
    await sleep(1100);
    const coords = await getCoordinates(geocodeQuery);
    if (coords) {
      console.log(`   📍 ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`);
    } else {
      console.log(`   📍 fallback coords used`);
    }

    // Upload 5 images from Unsplash using direct photo IDs
    const images = [];
    for (let j = 0; j < photoIds.length; j++) {
      const url = `https://images.unsplash.com/${photoIds[j]}?w=1280&q=80&fit=crop`;
      const img = await uploadToCloudinary(url);
      images.push(img);
      process.stdout.write(`   🖼  Uploading image ${j+1}/5...\r`);
    }
    console.log(`   🖼  5 images uploaded ✔          `);

    const listing = new Listing({
      title,
      category,
      description: `${title} — a wonderful ${category.toLowerCase()} located at ${displayLocation}. Experience the best of ${country} with premium amenities and breathtaking surroundings.`,
      location: displayLocation,
      country,
      price: priceINR,
      images,
      owner: userMap[hostUsername]._id,
      geometry: {
        type: "Point",
        coordinates: coords ? [coords.lon, coords.lat] : [77.2090, 28.6139],
      },
    });

    await listing.save();
    count++;
    console.log(`   ✅ Saved\n`);
  }

  console.log("=".repeat(56));
  console.log(`\n🎉 Seeding complete! Listings: ${count} | Users: ${USERS.length}`);
  console.log(`\n📋 All credentials (password: Pass@1234):`);
  USERS.forEach(u => console.log(`   ${u.username.padEnd(28)} ${u.email}`));
  console.log("\n" + "=".repeat(56));

  await mongoose.connection.close();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
