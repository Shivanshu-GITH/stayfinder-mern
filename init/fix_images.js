require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const mongoose   = require("mongoose");
const cloudinary = require("cloudinary").v2;
const Listing    = require("../models/listing");

cloudinary.config({
  cloud_name : process.env.CLOUD_NAME,
  api_key    : process.env.API_KEY,
  api_secret : process.env.API_SECRET,
});

const MONGO_URL = process.env.MONGO_URL;
const PLACEHOLDER_FILENAME = "stayfinder_images/placeholder";

// Verified working Unsplash photo IDs per category
const CATEGORY_PHOTOS = {
  "Apartment"     : ["photo-1555636222-cae831e670b3","photo-1486325212027-8081e485255e","photo-1502672260266-1c1ef2d93688","photo-1560448204-e02f11c3d0e2","photo-1522708323590-d24dbb6b0267","photo-1484154218962-a197022b5858","photo-1493809842364-78817add7ffb","photo-1536376072261-38c75010e6c9"],
  "House"         : ["photo-1518780664697-55e3ad937233","photo-1523217582562-09d0def993a6","photo-1558618666-fcd25c85cd64","photo-1570129477492-45c003edd2be","photo-1568605114967-8130f3a36994","photo-1583608205776-bfd35f0d9f83","photo-1512917774080-9991f1c4c750","photo-1600585154340-be6161a56a0c"],
  "Villa"         : ["photo-1537996194471-e657df975ab4","photo-1518548419970-58e3b4079ab2","photo-1573843981267-be1999ff37cd","photo-1552733407-5d5c46c3bb3b","photo-1512917774080-9991f1c4c750","photo-1598928506311-c55ded91a20c","photo-1582268611958-ebfd161ef9cf","photo-1571896349842-33c89424de2d"],
  "Hotel"         : ["photo-1566073771259-6a8506099945","photo-1551882547-ff40c63fe5fa","photo-1564501049412-61c2a3083791","photo-1578683010236-d716f9a3f461","photo-1542314831-068cd1dbfeeb","photo-1520250497591-112f2f40a3f4","photo-1571003123894-1f0594d2b5d9","photo-1582719478250-c89cae4dc85b"],
  "Hostel"        : ["photo-1555400038-63f5ba517a47","photo-1504280390367-361c6d9f38f4","photo-1520250497591-112f2f40a3f4","photo-1509600110300-21b9d5b0c77e","photo-1445019980597-93fa8acb246c","photo-1444201716572-c60ec6d63a61","photo-1475924156734-496f6cac6ec1","photo-1469796466635-455ede028aca"],
  "Resort"        : ["photo-1510414842594-a61c69b5ae57","photo-1514282401047-d79a71a590e8","photo-1573843981267-be1999ff37cd","photo-1544551763-46a013bb70d5","photo-1540202404-d0c7fe46a087","photo-1590523277543-a94d2e4eb00b","photo-1559827291-72416316b8c3","photo-1504870712357-65ea720d6078"],
  "Cottage"       : ["photo-1499793983690-e29da59ef1c2","photo-1568605114967-8130f3a36994","photo-1558618666-fcd25c85cd64","photo-1523217582562-09d0def993a6","photo-1600585154340-be6161a56a0c","photo-1505118380757-91f5f5632de0","photo-1487958449943-2429e8be8625","photo-1510798831971-661eb04b3739"],
  "Cabin"         : ["photo-1441974231531-c6227db76b6e","photo-1464822759023-fed622ff2c3b","photo-1476514525535-07fb3b4ae5f1","photo-1472214103451-9374bd1c798e","photo-1506905925346-21bda4d32df4","photo-1519681393784-d120267933ba","photo-1477346611705-65d1883cee1e","photo-1421789665209-c9b2a435e3dc"],
  "Farm Stay"     : ["photo-1500076656116-558758c991c1","photo-1464822759023-fed622ff2c3b","photo-1523217582562-09d0def993a6","photo-1499793983690-e29da59ef1c2","photo-1504280390367-361c6d9f38f4","photo-1568605114967-8130f3a36994","photo-1441974231531-c6227db76b6e","photo-1476514525535-07fb3b4ae5f1"],
  "Camping"       : ["photo-1509316785289-025f5b846b35","photo-1504280390367-361c6d9f38f4","photo-1516426122078-c23e76319801","photo-1547036967-23d11aacaee0","photo-1551632436-cbf8dd35adfa","photo-1504173010664-32509aeebb62","photo-1478265409525-aaeb37a8c9b7","photo-1531366936337-7c912a4589a7"],
  "Luxury"        : ["photo-1566073771259-6a8506099945","photo-1551882547-ff40c63fe5fa","photo-1564501049412-61c2a3083791","photo-1578683010236-d716f9a3f461","photo-1542314831-068cd1dbfeeb","photo-1512453979798-5ea266f8880c","photo-1582719508461-905c673771fd","photo-1590073844006-33379778ae09"],
  "Beachfront"    : ["photo-1505118380757-91f5f5632de0","photo-1590523277543-a94d2e4eb00b","photo-1504870712357-65ea720d6078","photo-1510414842594-a61c69b5ae57","photo-1514282401047-d79a71a590e8","photo-1544551763-46a013bb70d5","photo-1540202404-d0c7fe46a087","photo-1559827291-72416316b8c3"],
  "Mountain View" : ["photo-1477346611705-65d1883cee1e","photo-1506905925346-21bda4d32df4","photo-1519681393784-d120267933ba","photo-1464822759023-fed622ff2c3b","photo-1476514525535-07fb3b4ae5f1","photo-1441974231531-c6227db76b6e","photo-1472214103451-9374bd1c798e","photo-1421789665209-c9b2a435e3dc"],
  "City Stay"     : ["photo-1555636222-cae831e670b3","photo-1486325212027-8081e485255e","photo-1502672260266-1c1ef2d93688","photo-1560448204-e02f11c3d0e2","photo-1522708323590-d24dbb6b0267","photo-1484154218962-a197022b5858","photo-1493809842364-78817add7ffb","photo-1536376072261-38c75010e6c9"],
};

// Track which photo index to use per category to avoid repeats
const categoryIndex = {};

async function getReplacementImage(category) {
  const photos = CATEGORY_PHOTOS[category] || CATEGORY_PHOTOS["Apartment"];
  const idx = categoryIndex[category] || 0;
  categoryIndex[category] = (idx + 1) % photos.length;
  const photoId = photos[idx];
  const url = `https://images.unsplash.com/${photoId}?w=1280&q=80&fit=crop`;

  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: "stayfinder_images",
      transformation: [{ width: 1200, height: 800, crop: "fill", quality: "auto" }],
    });
    return { url: result.secure_url, filename: result.public_id };
  } catch (err) {
    console.warn(`     ⚠ Cloudinary upload failed: ${err.message}`);
    return null;
  }
}

function isBroken(img) {
  return (
    img.filename === PLACEHOLDER_FILENAME ||
    img.filename === "stayfinder_images/placeholder" ||
    !img.filename ||
    img.url === "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80" ||
    !img.url
  );
}

async function fixImages() {
  await mongoose.connect(MONGO_URL);
  console.log("\n✅ Connected to MongoDB\n");

  const listings = await Listing.find({});
  console.log(`📋 Found ${listings.length} listings\n`);

  let totalFixed = 0;
  let listingsFixed = 0;

  for (const listing of listings) {
    const brokenIndexes = [];
    listing.images.forEach((img, i) => {
      if (isBroken(img)) brokenIndexes.push(i);
    });

    if (brokenIndexes.length === 0) continue;

    console.log(`🔧 [${listing.title}] — ${brokenIndexes.length} broken image(s)`);

    for (const idx of brokenIndexes) {
      process.stdout.write(`   Replacing image ${idx + 1}...`);
      const newImg = await getReplacementImage(listing.category);
      if (newImg) {
        listing.images[idx] = newImg;
        console.log(` ✔ Done`);
        totalFixed++;
      } else {
        console.log(` ✗ Skipped (upload failed)`);
      }
    }

    listing.markModified("images");
    await listing.save();
    listingsFixed++;
    console.log(`   ✅ Listing saved\n`);
  }

  if (totalFixed === 0) {
    console.log("✅ No broken images found! Everything looks good.\n");
  } else {
    console.log("=".repeat(50));
    console.log(`\n🎉 Fix complete!`);
    console.log(`   Listings fixed : ${listingsFixed}`);
    console.log(`   Images replaced: ${totalFixed}`);
    console.log("\n" + "=".repeat(50));
  }

  await mongoose.connection.close();
}

fixImages().catch((err) => {
  console.error("❌ Fix failed:", err.message);
  process.exit(1);
});
