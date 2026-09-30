import 'dotenv/config';
import mongoose from 'mongoose';
import Recipe from '../src/models/Recipe.js';
import AppSetting from '../src/models/AppSetting.js';
import { defaultPlans } from '../src/config/defaultPlans.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before running the seed script.');
  process.exit(1);
}

const translationsBySlug = {
  'tomato-rice': {
    ta: {
      title: 'தக்காளி சாதம்',
      description: 'தக்காளி, கறிவேப்பிலை, எலுமிச்சை நறுமணத்துடன் மெதுவாக மசாலா சேர்த்த சாதம்.',
      cuisine: 'தென்னிந்திய',
      ingredients: [
        { name: 'சமைத்த அரிசி', unit: 'கப்' }, { name: 'தக்காளி', unit: 'நடுத்தர', preparation: 'நறுக்கியது' },
        { name: 'வெங்காயம்', unit: 'நடுத்தர', preparation: 'நீளவாக்கில் நறுக்கியது' }, { name: 'கடுகு', unit: 'டீஸ்பூன்' },
        { name: 'கறிவேப்பிலை', unit: 'இலைகள்' }, { name: 'மஞ்சள் தூள்', unit: 'டீஸ்பூன்' },
        { name: 'எலுமிச்சை', unit: 'பாதி' }, { name: 'சமையல் எண்ணெய்', unit: 'மேசைக்கரண்டி' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'எண்ணெயில் கடுகு, கறிவேப்பிலையைத் தாளிக்கவும்.' },
        { stepNumber: 2, instruction: 'வெங்காயத்தை வதக்கி மஞ்சள், தக்காளி சேர்க்கவும்.' },
        { stepNumber: 3, instruction: 'தக்காளி கெட்டியானதும் சாதம் சேர்த்துக் கிளறவும்.' },
        { stepNumber: 4, instruction: 'எலுமிச்சைச் சாறு சேர்த்து சிறிது நேரம் வைக்கவும்.' },
      ],
    },
    hi: {
      title: 'टमाटर चावल',
      description: 'टमाटर, करी पत्ते और नींबू की हल्की खुशबू वाला मसालेदार चावल।',
      cuisine: 'दक्षिण भारतीय',
      ingredients: [
        { name: 'पका हुआ चावल', unit: 'कप' }, { name: 'टमाटर', unit: 'मध्यम', preparation: 'कटा हुआ' },
        { name: 'प्याज़', unit: 'मध्यम', preparation: 'लंबाई में कटा' }, { name: 'राई', unit: 'चम्मच' },
        { name: 'करी पत्ते', unit: 'पत्ते' }, { name: 'हल्दी पाउडर', unit: 'चम्मच' },
        { name: 'नींबू', unit: 'आधा' }, { name: 'खाना पकाने का तेल', unit: 'बड़ा चम्मच' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'गरम तेल में राई और करी पत्ते तड़काएँ।' },
        { stepNumber: 2, instruction: 'प्याज़ नरम करें; हल्दी और टमाटर मिलाएँ।' },
        { stepNumber: 3, instruction: 'टमाटर गाढ़े हों तो चावल मिलाकर स्वादानुसार नमक डालें।' },
        { stepNumber: 4, instruction: 'नींबू का रस डालें और थोड़ी देर रखें।' },
      ],
    },
  },
  'potato-roast': {
    ta: {
      title: 'உருளைக்கிழங்கு வறுவல்',
      description: 'மிளகு, சீரகம், சிறிது மிளகாயுடன் வறுத்த மொறுமொறு உருளைக்கிழங்கு.',
      cuisine: 'தமிழ்',
      ingredients: [
        { name: 'உருளைக்கிழங்கு', unit: 'கிராம்', preparation: 'சிறிய துண்டுகளாக வெட்டியது' }, { name: 'சமையல் எண்ணெய்', unit: 'மேசைக்கரண்டி' },
        { name: 'சீரகம்', unit: 'டீஸ்பூன்' }, { name: 'மிளகுத்தூள்', unit: 'டீஸ்பூன்' },
        { name: 'மிளகாய்த்தூள்', unit: 'டீஸ்பூன்' }, { name: 'உப்பு', unit: 'தேவைக்கேற்ப' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'உருளைக்கிழங்கைக் கழுவி, நறுக்கி நன்கு உலர்த்தவும்.' },
        { stepNumber: 2, instruction: 'எண்ணெயில் சீரகத்தை வறுத்து உருளைக்கிழங்கைச் சேர்க்கவும்.' },
        { stepNumber: 3, instruction: 'பொன்னிறமாகும் வரை வறுத்து, இறுதியில் மசாலா சேர்க்கவும்.' },
      ],
    },
    hi: {
      title: 'आलू रोस्ट',
      description: 'काली मिर्च, जीरा और थोड़ी मिर्च के साथ कुरकुरे भुने आलू।',
      cuisine: 'तमिल',
      ingredients: [
        { name: 'आलू', unit: 'ग्राम', preparation: 'छोटे टुकड़ों में कटा' }, { name: 'खाना पकाने का तेल', unit: 'बड़ा चम्मच' },
        { name: 'जीरा', unit: 'चम्मच' }, { name: 'काली मिर्च पाउडर', unit: 'चम्मच' },
        { name: 'मिर्च पाउडर', unit: 'चम्मच' }, { name: 'नमक', unit: 'स्वादानुसार' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'आलू धोकर काटें और अच्छी तरह सुखाएँ।' },
        { stepNumber: 2, instruction: 'तेल गरम करें, जीरा भूनें और आलू डालें।' },
        { stepNumber: 3, instruction: 'सुनहरा और नरम होने तक भूनें; अंत में मसाले डालें।' },
      ],
    },
  },
  'vegetable-fried-rice': {
    ta: {
      title: 'காய்கறி வறுத்த சாதம்',
      description: 'குளிரவைத்த சாதம் மற்றும் காய்கறிகளைக் கொண்டு விரைவாகச் செய்யும் உணவு.',
      cuisine: 'கிழக்காசிய பாணி',
      ingredients: [
        { name: 'சமைத்த அரிசி', unit: 'கப்', preparation: 'குளிரவைத்தது' }, { name: 'கேரட்', unit: 'நடுத்தர', preparation: 'சிறு துண்டுகளாக்கியது' },
        { name: 'பச்சைப் பட்டாணி', unit: 'கப்' }, { name: 'வெங்காயத்தாள்', unit: 'தண்டுகள்', preparation: 'நறுக்கியது' },
        { name: 'சோயா சாஸ்', unit: 'மேசைக்கரண்டி' }, { name: 'சமையல் எண்ணெய்', unit: 'மேசைக்கரண்டி' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'கேரட், பட்டாணியைச் சிறிது வதக்கவும்.' },
        { stepNumber: 2, instruction: 'குளிர்ந்த சாதத்தைச் சேர்த்து கட்டிகளைப் பிரிக்கவும்.' },
        { stepNumber: 3, instruction: 'சோயா சாஸ் சேர்த்துக் கிளறி வெங்காயத்தாள் தூவவும்.' },
      ],
    },
    hi: {
      title: 'सब्ज़ी फ्राइड राइस',
      description: 'ठंडे चावल और फ्रिज़ में मौजूद सब्ज़ियों से बना झटपट खाना।',
      cuisine: 'पूर्वी एशियाई शैली',
      ingredients: [
        { name: 'पका हुआ चावल', unit: 'कप', preparation: 'ठंडा' }, { name: 'गाजर', unit: 'मध्यम', preparation: 'छोटे टुकड़ों में कटी' },
        { name: 'हरी मटर', unit: 'कप' }, { name: 'हरा प्याज़', unit: 'डंठल', preparation: 'कटा हुआ' },
        { name: 'सोया सॉस', unit: 'बड़ा चम्मच' }, { name: 'खाना पकाने का तेल', unit: 'बड़ा चम्मच' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'गाजर और मटर को हल्का नरम होने तक भूनें।' },
        { stepNumber: 2, instruction: 'ठंडे चावल डालें और गुठलियाँ तोड़ें।' },
        { stepNumber: 3, instruction: 'सोया सॉस मिलाएँ और ऊपर से हरा प्याज़ डालें।' },
      ],
    },
  },
  'dal-tadka': {
    ta: {
      title: 'தாளித்த பருப்பு',
      description: 'சீரகம், பூண்டு, மிளகாய்த் தாளிப்புடன் மணக்கும் பருப்பு உணவு.',
      cuisine: 'வடஇந்திய',
      ingredients: [
        { name: 'சிவப்பு பருப்பு', unit: 'கப்' }, { name: 'தக்காளி', unit: 'நடுத்தர', preparation: 'நறுக்கியது' },
        { name: 'பூண்டு', unit: 'பற்கள்', preparation: 'நீளவாக்கில் நறுக்கியது' }, { name: 'சீரகம்', unit: 'டீஸ்பூன்' },
        { name: 'மஞ்சள் தூள்', unit: 'டீஸ்பூன்' }, { name: 'நெய் அல்லது எண்ணெய்', unit: 'மேசைக்கரண்டி' },
        { name: 'காய்ந்த சிவப்பு மிளகாய்', unit: 'துண்டு' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'பருப்பு, மஞ்சளை வேகவைத்து மென்மையானதும் தக்காளி சேர்க்கவும்.' },
        { stepNumber: 2, instruction: 'நெய்யில் சீரகம், பூண்டு, மிளகாயைத் தாளிக்கவும்.' },
        { stepNumber: 3, instruction: 'தாளிப்பைப் பருப்பில் ஊற்றவும்.' },
      ],
    },
    hi: {
      title: 'दाल तड़का',
      description: 'जीरा, लहसुन और मिर्च के तड़के वाली आरामदायक दाल।',
      cuisine: 'उत्तर भारतीय',
      ingredients: [
        { name: 'मसूर दाल', unit: 'कप' }, { name: 'टमाटर', unit: 'मध्यम', preparation: 'कटा हुआ' },
        { name: 'लहसुन', unit: 'कलियाँ', preparation: 'लंबाई में कटा' }, { name: 'जीरा', unit: 'चम्मच' },
        { name: 'हल्दी पाउडर', unit: 'चम्मच' }, { name: 'घी या तेल', unit: 'बड़ा चम्मच' },
        { name: 'सूखी लाल मिर्च', unit: 'टुकड़ा' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'दाल और हल्दी नरम होने तक पकाएँ; टमाटर मिलाएँ।' },
        { stepNumber: 2, instruction: 'घी में जीरा, लहसुन और मिर्च तड़काएँ।' },
        { stepNumber: 3, instruction: 'तड़का दाल के ऊपर डालें।' },
      ],
    },
  },
  'paneer-masala': {
    ta: {
      title: 'பனீர் மசாலா',
      description: 'தக்காளி, மசாலா சேர்த்த மிதமான குழம்பில் பனீர்; இறுதியில் கிரீம்.',
      cuisine: 'வடஇந்திய',
      ingredients: [
        { name: 'பனீர்', unit: 'கிராம்', preparation: 'கட்டங்களாக நறுக்கியது' }, { name: 'தக்காளி', unit: 'நடுத்தர', preparation: 'அரைத்தது' },
        { name: 'வெங்காயம்', unit: 'பெரியது', preparation: 'பொடியாக நறுக்கியது' }, { name: 'இஞ்சி', unit: 'டீஸ்பூன்', preparation: 'துருவியது' },
        { name: 'சீரகத் தூள்', unit: 'டீஸ்பூன்' }, { name: 'கரம் மசாலா', unit: 'டீஸ்பூன்' },
        { name: 'கிரீம்', unit: 'மேசைக்கரண்டி' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'வெங்காயத்தை வதக்கி இஞ்சி, மசாலா சேர்க்கவும்.' },
        { stepNumber: 2, instruction: 'தக்காளி விழுதைக் கெட்டியாகும் வரை வேகவைக்கவும்.' },
        { stepNumber: 3, instruction: 'பனீர் சேர்த்து மெதுவாகச் சூடாக்கி கிரீம் சேர்க்கவும்.' },
      ],
    },
    hi: {
      title: 'पनीर मसाला',
      description: 'हल्की टमाटर-मसाले की ग्रेवी में पनीर, ऊपर से थोड़ी क्रीम।',
      cuisine: 'उत्तर भारतीय',
      ingredients: [
        { name: 'पनीर', unit: 'ग्राम', preparation: 'टुकड़ों में कटा' }, { name: 'टमाटर', unit: 'मध्यम', preparation: 'प्यूरी' },
        { name: 'प्याज़', unit: 'बड़ा', preparation: 'बारीक कटा' }, { name: 'अदरक', unit: 'चम्मच', preparation: 'कद्दूकस किया' },
        { name: 'जीरा पाउडर', unit: 'चम्मच' }, { name: 'गरम मसाला', unit: 'चम्मच' },
        { name: 'क्रीम', unit: 'बड़ा चम्मच' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'प्याज़ नरम करें; अदरक और मसाले मिलाएँ।' },
        { stepNumber: 2, instruction: 'टमाटर की प्यूरी गाढ़ी होने तक पकाएँ।' },
        { stepNumber: 3, instruction: 'पनीर डालकर हल्का गरम करें और क्रीम मिलाएँ।' },
      ],
    },
  },
  sambar: {
    ta: {
      title: 'சாம்பார்',
      description: 'புளி, பருப்பு, காய்கறி மற்றும் மணமான தாளிப்புடன் சுவையான குழம்பு.',
      cuisine: 'தென்னிந்திய',
      ingredients: [
        { name: 'துவரம் பருப்பு', unit: 'கப்' }, { name: 'கேரட்', unit: 'நடுத்தர', preparation: 'நறுக்கியது' },
        { name: 'முருங்கைக்காய்', unit: 'துண்டு', preparation: 'நீளத் துண்டுகளாக வெட்டியது' }, { name: 'புளி', unit: 'சிறிய துண்டு' },
        { name: 'சாம்பார் பொடி', unit: 'மேசைக்கரண்டி' }, { name: 'கடுகு', unit: 'டீஸ்பூன்' },
        { name: 'கறிவேப்பிலை', unit: 'இலைகள்' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'பருப்பை வேகவைக்கவும்; புளியை ஊறவைத்து கரைசல் எடுக்கவும்.' },
        { stepNumber: 2, instruction: 'காய்கறிகளை சாம்பார் பொடியில் வேகவைத்து பருப்பு, புளி சேர்க்கவும்.' },
        { stepNumber: 3, instruction: 'கடுகு, கறிவேப்பிலையைத் தாளித்து சாம்பாரில் சேர்க்கவும்.' },
      ],
    },
    hi: {
      title: 'सांभर',
      description: 'इमली, दाल और सब्ज़ियों से बना खट्टा-मसालेदार सांभर।',
      cuisine: 'दक्षिण भारतीय',
      ingredients: [
        { name: 'अरहर दाल', unit: 'कप' }, { name: 'गाजर', unit: 'मध्यम', preparation: 'कटी हुई' },
        { name: 'सहजन', unit: 'टुकड़ा', preparation: 'लंबाई में कटा' }, { name: 'इमली', unit: 'छोटा टुकड़ा' },
        { name: 'सांभर मसाला', unit: 'बड़ा चम्मच' }, { name: 'राई', unit: 'चम्मच' },
        { name: 'करी पत्ते', unit: 'पत्ते' },
      ],
      steps: [
        { stepNumber: 1, instruction: 'दाल पकाएँ; इमली भिगोकर उसका रस निकालें।' },
        { stepNumber: 2, instruction: 'सब्ज़ियाँ सांभर मसाले में पकाएँ; दाल और इमली मिलाएँ।' },
        { stepNumber: 3, instruction: 'राई और करी पत्ते तड़काकर सांभर में मिलाएँ।' },
      ],
    },
  },
};

const recipes = [
  {
    title: 'Tomato Rice', slug: 'tomato-rice', description: 'Bright, gently spiced rice with ripe tomatoes, curry leaves and a squeeze of lime.',
    image: 'photo-1512058564366-18510be2db19', cuisine: 'South Indian', diet: ['vegetarian', 'vegan', 'gluten-free'], mealTypes: ['lunch', 'dinner'],
    servings: 4, difficulty: 'easy', tags: ['one pot', 'rice', 'weeknight'],
    ingredients: [
      { name: 'Cooked rice', quantity: 3, unit: 'cups' }, { name: 'Tomatoes', quantity: 3, unit: 'medium', preparation: 'chopped' },
      { name: 'Onion', quantity: 1, unit: 'medium', preparation: 'sliced' }, { name: 'Mustard seeds', quantity: 1, unit: 'tsp' },
      { name: 'Curry leaves', quantity: 8, unit: 'leaves' }, { name: 'Ground turmeric', quantity: 0.25, unit: 'tsp' },
      { name: 'Lime', quantity: 1, unit: 'half' }, { name: 'Neutral oil', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Temper mustard seeds and curry leaves in warm oil.' },
      { stepNumber: 2, instruction: 'Soften the onion, then stir in turmeric and tomatoes.' },
      { stepNumber: 3, instruction: 'Cook tomatoes until thick. Fold in the rice and season.' },
      { stepNumber: 4, instruction: 'Add lime juice and rest briefly.' },
    ],
  },
  {
    title: 'Potato Roast', slug: 'potato-roast', description: 'Crisp-edged potatoes tossed with pepper, cumin and a little chilli.',
    image: 'photo-1518977676601-b53f82aba655', cuisine: 'Tamil', diet: ['vegetarian', 'vegan', 'gluten-free'], mealTypes: ['side', 'dinner'],
    servings: 4, difficulty: 'easy', tags: ['potato', 'side dish', 'pan roasted'],
    ingredients: [
      { name: 'Potatoes', quantity: 700, unit: 'g', preparation: 'cut into small cubes' }, { name: 'Neutral oil', quantity: 2, unit: 'tbsp' },
      { name: 'Cumin seeds', quantity: 1, unit: 'tsp' }, { name: 'Ground black pepper', quantity: 0.5, unit: 'tsp' },
      { name: 'Chilli powder', quantity: 0.5, unit: 'tsp' }, { name: 'Salt', quantity: 0, unit: 'to taste' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Rinse, cube and dry the potatoes.' },
      { stepNumber: 2, instruction: 'Heat oil, toast cumin, then add the potatoes.' },
      { stepNumber: 3, instruction: 'Roast until golden and tender; season near the end.' },
    ],
  },
  {
    title: 'Vegetable Fried Rice', slug: 'vegetable-fried-rice', description: 'A quick, flexible skillet rice for the vegetables already in your fridge.',
    image: 'photo-1603133872878-684f208fb84b', cuisine: 'East Asian-inspired', diet: ['vegetarian', 'vegan'], mealTypes: ['lunch', 'dinner'],
    servings: 3, difficulty: 'easy', tags: ['quick', 'leftovers', 'rice'],
    ingredients: [
      { name: 'Cooked rice', quantity: 3, unit: 'cups', preparation: 'chilled' }, { name: 'Carrot', quantity: 1, unit: 'medium', preparation: 'diced' },
      { name: 'Green peas', quantity: 0.5, unit: 'cup' }, { name: 'Spring onion', quantity: 2, unit: 'stalks', preparation: 'sliced' },
      { name: 'Soy sauce', quantity: 1.5, unit: 'tbsp' }, { name: 'Neutral oil', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Stir-fry carrot and peas until just tender.' },
      { stepNumber: 2, instruction: 'Add chilled rice and break up clumps.' },
      { stepNumber: 3, instruction: 'Toss with soy sauce; finish with spring onion.' },
    ],
  },
  {
    title: 'Dal Tadka', slug: 'dal-tadka', description: 'Comforting lentils finished with a fragrant cumin, garlic and chilli tempering.',
    image: 'photo-1546833999-b9f581a1996d', cuisine: 'North Indian', diet: ['vegetarian', 'gluten-free'], mealTypes: ['lunch', 'dinner'],
    servings: 4, difficulty: 'easy', tags: ['lentils', 'comfort food', 'protein'],
    ingredients: [
      { name: 'Red lentils', quantity: 1, unit: 'cup' }, { name: 'Tomato', quantity: 1, unit: 'medium', preparation: 'chopped' },
      { name: 'Garlic', quantity: 3, unit: 'cloves', preparation: 'sliced' }, { name: 'Cumin seeds', quantity: 1, unit: 'tsp' },
      { name: 'Ground turmeric', quantity: 0.25, unit: 'tsp' }, { name: 'Ghee or oil', quantity: 1, unit: 'tbsp' },
      { name: 'Dried red chilli', quantity: 1, unit: 'piece', optional: true },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Simmer rinsed lentils with turmeric until soft; add tomato.' },
      { stepNumber: 2, instruction: 'Sizzle cumin, garlic and chilli in ghee or oil.' },
      { stepNumber: 3, instruction: 'Pour the tempering over the lentils.' },
    ],
  },
  {
    title: 'Paneer Masala', slug: 'paneer-masala', description: 'Paneer in a mellow tomato and spice sauce, finished with a spoon of cream.',
    image: 'photo-1631452180519-c014fe946bc7', cuisine: 'North Indian', diet: ['vegetarian', 'gluten-free'], mealTypes: ['dinner'],
    servings: 4, difficulty: 'medium', tags: ['paneer', 'curry', 'weekend'],
    ingredients: [
      { name: 'Paneer', quantity: 400, unit: 'g', cubed: true }, { name: 'Tomatoes', quantity: 3, unit: 'medium', preparation: 'pureed' },
      { name: 'Onion', quantity: 1, unit: 'large', preparation: 'finely chopped' }, { name: 'Ginger', quantity: 1, unit: 'tsp', preparation: 'grated' },
      { name: 'Ground cumin', quantity: 1, unit: 'tsp' }, { name: 'Garam masala', quantity: 1, unit: 'tsp' },
      { name: 'Cream', quantity: 2, unit: 'tbsp', optional: true },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Soften onion; add ginger and spices.' },
      { stepNumber: 2, instruction: 'Simmer tomato puree until thick.' },
      { stepNumber: 3, instruction: 'Fold in paneer, warm gently and finish with cream.' },
    ],
  },
  {
    title: 'Sambar', slug: 'sambar', description: 'A tangy lentil and vegetable stew with tamarind and a fragrant spice tempering.',
    image: 'photo-1547592180-85f173990554', cuisine: 'South Indian', diet: ['vegetarian', 'vegan', 'gluten-free'], mealTypes: ['lunch', 'dinner'],
    servings: 6, difficulty: 'medium', tags: ['lentils', 'vegetables', 'tamarind'],
    ingredients: [
      { name: 'Toor dal', quantity: 1, unit: 'cup' }, { name: 'Carrot', quantity: 1, unit: 'medium', preparation: 'chopped' },
      { name: 'Drumstick', quantity: 1, unit: 'piece', preparation: 'cut into lengths', optional: true },
      { name: 'Tamarind', quantity: 1, unit: 'small piece' }, { name: 'Sambar powder', quantity: 2, unit: 'tbsp' },
      { name: 'Mustard seeds', quantity: 1, unit: 'tsp' }, { name: 'Curry leaves', quantity: 8, unit: 'leaves' },
    ],
    steps: [
      { stepNumber: 1, instruction: 'Cook dal until soft; soak tamarind and extract its juice.' },
      { stepNumber: 2, instruction: 'Simmer vegetables with sambar powder; add tamarind and dal.' },
      { stepNumber: 3, instruction: 'Temper mustard and curry leaves; stir through.' },
    ],
  },
].map((recipe) => ({
  ...recipe,
  translations: translationsBySlug[recipe.slug],
  description: `${recipe.description} Demo data.`,
  coverImage: {
    url: `https://images.unsplash.com/${recipe.image}?auto=format&fit=crop&w=1200&q=85`,
    alt: recipe.title,
    publicId: '',
  },
  cuisine: { primary: recipe.cuisine },
  source: 'original',
  status: 'published',
  visibility: 'public',
  isDemo: true,
})).filter((recipe) => ['Tamil', 'South Indian', 'North Indian'].includes(recipe.cuisine.primary));

try {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });
  await Promise.all(recipes.map(({ slug, ...recipe }) => Recipe.updateOne(
    { slug },
    { $set: { slug, ...recipe }, $unset: { prepTimeMinutes: '', cookTimeMinutes: '', totalTimeMinutes: '' } },
    { upsert: true },
  )));
  await AppSetting.updateOne(
    { key: 'plans' },
    { $setOnInsert: { key: 'plans', value: defaultPlans } },
    { upsert: true },
  );
  console.log(`Seeded ${recipes.length} original demo recipes.`);
} finally {
  await mongoose.disconnect();
}