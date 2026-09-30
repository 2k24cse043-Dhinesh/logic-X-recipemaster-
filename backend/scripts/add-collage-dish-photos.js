import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';

const photos = [
  {
    title: 'Chicken Curry',
    slug: 'chicken-curry-india-kerala',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Chicken_makhani.jpg/960px-Chicken_makhani.jpg',
    alt: 'Chicken makhani curry',
    creator: 'stu_spivack',
    license: 'CC BY-SA 2.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/2.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chicken_makhani.jpg',
  },
  {
    title: 'Jalebi',
    slug: 'jalebi-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Jalebi-_Kolkata_-_West_Bengal_-_DSC_0011.jpg/960px-Jalebi-_Kolkata_-_West_Bengal_-_DSC_0011.jpg',
    alt: 'Jalebi, Kolkata, West Bengal',
    creator: 'TAPAS KUMAR HALDER',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Jalebi-_Kolkata_-_West_Bengal_-_DSC_0011.jpg',
  },
  {
    title: 'Parotta',
    slug: 'parotta-india-tamil-nadu',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Parotta_from_Kerala.jpg/960px-Parotta_from_Kerala.jpg',
    alt: 'Parotta from Kerala',
    creator: 'Ganesh Mohan T',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Parotta_from_Kerala.jpg',
  },
  {
    title: 'Roti',
    slug: 'roti-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Roti_%28Indian_Flatbread%29_%28Unsplash%29.jpg/960px-Roti_%28Indian_Flatbread%29_%28Unsplash%29.jpg',
    alt: 'Roti, Indian flatbread',
    creator: 'Igor Ovsyannykov',
    license: 'CC0',
    licenseUrl: 'http://creativecommons.org/publicdomain/zero/1.0/deed.en',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Roti_(Indian_Flatbread)_(Unsplash).jpg',
  },
  {
    title: 'Naan',
    slug: 'naan-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Naan_Bread.JPG/960px-Naan_Bread.JPG',
    alt: 'Naan bread',
    creator: 'Siddhantsahni28',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Naan_Bread.JPG',
  },
  {
    title: 'Aloo Gobi',
    slug: 'aloo-gobi-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Aloo_Gobi_Sabzi.jpg/960px-Aloo_Gobi_Sabzi.jpg',
    alt: 'Aloo Gobi sabzi',
    creator: 'TabassumJawed',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Aloo_Gobi_Sabzi.jpg',
  },
  {
    title: 'Chana Masala',
    slug: 'chana-masala-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg/960px-Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg',
    alt: 'Chana Masala',
    creator: 'Parzeus',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Chana_Masala_in_Paul%C3%ADnia%2C_2023-10-16.jpg',
  },
  {
    title: 'Palak Paneer',
    slug: 'palak-paneer-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Yummy_Palak_Paneer.jpg/960px-Yummy_Palak_Paneer.jpg',
    alt: 'Palak paneer',
    creator: 'Akash128',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Yummy_Palak_Paneer.jpg',
  },
  {
    title: 'Dal Tadka',
    slug: 'dal-tadka-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dc/Dal_tadka_Picture.JPG/960px-Dal_tadka_Picture.JPG',
    alt: 'Dal tadka',
    creator: 'Nithyasrm',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dal_tadka_Picture.JPG',
  },
  {
    title: 'Paneer Tikka',
    slug: 'paneer-tikka-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Paneer_tikka_1.jpg/960px-Paneer_tikka_1.jpg',
    alt: 'Paneer tikka',
    creator: 'Srikoundinya66',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Paneer_tikka_1.jpg',
  },
  {
    title: 'Kerala Chicken Curry',
    slug: 'kerala-chicken-curry-india-kerala',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Kerala_Chicken_Curry.jpg/960px-Kerala_Chicken_Curry.jpg',
    alt: 'Kerala chicken curry',
    creator: 'AparnaSujathan',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Kerala_Chicken_Curry.jpg',
  },
  {
    title: 'Gulab Jamun',
    slug: 'gulab-jamun-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Gulab_Jamun_indian_Sweet.jpg/960px-Gulab_Jamun_indian_Sweet.jpg',
    alt: 'Gulab jamun',
    creator: 'Manasa',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gulab_Jamun_indian_Sweet.jpg',
  },
  {
    title: 'Samosa',
    slug: 'samosa-india-punjab',
    url: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Samosa_and_Tamoto_Chilli_Ketchup_%E2%80%93_Kolkata.jpg/960px-Samosa_and_Tamoto_Chilli_Ketchup_%E2%80%93_Kolkata.jpg',
    alt: 'Samosa with tomato chilli ketchup',
    creator: 'TAPAS KUMAR HALDER',
    license: 'CC BY-SA 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Samosa_and_Tamoto_Chilli_Ketchup_%E2%80%93_Kolkata.jpg',
  },
];

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  const updatedTitles = [];

  for (const photo of photos) {
    const result = await Recipe.updateOne(
      { slug: photo.slug, status: 'published', visibility: 'public' },
      {
        $set: {
          coverImage: {
            url: photo.url,
            publicId: '',
            alt: photo.alt,
            creator: photo.creator,
            license: photo.license,
            licenseUrl: photo.licenseUrl,
            sourceUrl: photo.sourceUrl,
            provider: 'Wikimedia Commons',
            lookupStatus: 'found',
            searchedAt: new Date(),
          },
        },
      },
    );

    if (!result.matchedCount) throw new Error(`Published recipe not found: ${photo.title} (${photo.slug})`);
    updatedTitles.push(photo.title);
  }

  console.log(JSON.stringify({ updatedCount: updatedTitles.length, titles: updatedTitles }, null, 2));
} finally {
  await mongoose.disconnect();
}