import 'dotenv/config';
import mongoose from 'mongoose';
import Cuisine from '../src/models/Cuisine.js';
import Recipe from '../src/models/Recipe.js';

if (!process.env.MONGODB_URI) {
  console.error('Set MONGODB_URI in backend/.env before importing the dish catalog.');
  process.exit(1);
}

const collections = [
  { name: 'Everyday Favourites', dishes: `Fried Rice|Noodles|Pasta|Pizza|Burgers|Sandwich|Wrap|Tacos|Burritos|Curry|Biryani|Pulao|Fried Chicken|Grilled Chicken|Roast Chicken|Steak|Fish Fry|Fish Curry|Vegetable Curry|Dal|Rice and Curry|Soup|Salad|Omelette|Scrambled Eggs|Pancakes|Waffles|French Toast|Porridge|Toast|Dumplings` },
  { name: 'Festival / Religious Foods', dishes: `Pongal|Sakkarai Pongal|Modak|Kozhukattai|Payasam|Kheer|Laddu|Jalebi|Gulab Jamun|Rasgulla|Halwa|Puran Poli|Gujiya|Karanji|Peda|Mysore Pak|Adhirasam|Appam|Neyyappam|Unniyappam|Panakam|Vada|Sundal|Sabudana Khichdi|Sabudana Vada|Sheera|Pooran Poli|Thekua|Malpua` },
  { name: 'Fusion', dishes: `Indo-Chinese Fried Rice|Gobi Manchurian|Chicken Manchurian|Chilli Paneer|Paneer Pizza|Butter Chicken Pizza|Tandoori Chicken Pizza|Masala Pasta|Curry Pasta|Tikka Masala Pasta|Indian Tacos|Naan Pizza|Biryani Arancini|Masala Burger|Tandoori Burger|Curry Burger|Samosa Chaat|Pizza Samosa|Chocolate Samosa|Masala Fries|Tandoori Momos|Butter Chicken Momos|Paneer Tacos|Chicken Tikka Tacos` },
  { name: 'Street Food', dishes: `Samosa|Kachori|Pani Puri|Bhel Puri|Sev Puri|Dahi Puri|Vada Pav|Pav Bhaji|Misal Pav|Dabeli|Aloo Tikki|Chole Bhature|Pakora|Bhaji|Kathi Roll|Frankie|Momos|Chow Mein|Egg Roll|Shawarma|Falafel|Döner|Tacos|Elote|Arepas|Empanadas|Choripán|Takoyaki|Okonomiyaki|Yakitori` },
  { name: 'Vegan / Plant-Based', dishes: `Dal Tadka|Dal Makhani|Chana Masala|Rajma Masala|Aloo Gobi|Baingan Bharta|Vegetable Biryani|Vegetable Pulao|Chole|Sambar|Rasam|Avial|Poriyal|Kootu|Vegetable Korma|Falafel|Hummus|Baba Ganoush|Mujadara|Tabouleh|Ratatouille|Vegetable Tagine|Minestrone|Gazpacho|Vegetable Paella|Vegan Sushi|Vegetable Pad Thai|Tofu Curry|Mapo Tofu` },
];

const regions = [
  { continent: 'Africa', country: 'Cameroon', dishes: `Ndolé|Eru|Achu Soup|Koki|Fufu Corn|Poulet DG|Suya|Mbongo Tchobi|Nkui|Pepper Soup|Plantain and Beans|Jollof Rice|Fish Roll|Puff-Puff|Chin Chin` },
  { continent: 'Africa', country: 'Congo', dishes: `Moambe Chicken|Poulet à la Moambé|Saka-Saka|Liboké|Fufu|Lituma|Pondu|Chikwangue|Makayabu|Ntaba|Mikate` },
  { continent: 'Africa', country: 'Eritrea', dishes: `Zigni|Injera|Shiro|Alicha|Tsebhi|Kitcha Fit-Fit|Ful|Hamli|Timtimo|Ga'at|Sambusa` },
  { continent: 'Africa', country: 'Ethiopia', dishes: `Injera|Doro Wat|Misir Wat|Shiro Wat|Tibs|Kitfo|Gomen|Atakilt Wat|Firfir|Beyaynetu|Dulet|Azifa|Sambusa|Ful Medames|Chechebsa` },
  { continent: 'Africa', country: 'Ghana', dishes: `Jollof Rice|Waakye|Banku|Kenkey|Fufu|Red Red|Groundnut Soup|Light Soup|Palm Nut Soup|Kontomire Stew|Kelewele|Tuo Zaafi|Ampesi|Chinchinga|Bofrot|Sobolo` },
  { continent: 'Africa', country: 'Kenya', dishes: `Ugali|Nyama Choma|Sukuma Wiki|Githeri|Pilau|Mukimo|Irio|Chapati|Matoke|Bhajia|Samosa|Mandazi|Maharagwe|Viazi Karai` },
  { continent: 'Africa', country: 'Madagascar', dishes: `Romazava|Ravitoto|Akoho Sy Voanio|Akoho Rony|Hen'omby|Lasary|Mofo Gasy|Vary Amin'anana|Koba|Masikita|Sambos|Mokary` },
  { continent: 'Africa', country: 'Morocco', dishes: `Chicken Tagine|Lamb Tagine|Beef Tagine|Vegetable Tagine|Couscous|Harira|Bastilla|Pastilla|Tanjia|Rfissa|Mechoui|Zaalouk|Taktouka|Briouat|Msemen|Baghrir|Chebakia|Sellou|Maakouda|B'stilla` },
  { continent: 'Africa', country: 'Mozambique', dishes: `Matapa|Peri-Peri Chicken|Piri-Piri Prawns|Chamussas|Xima|Caril de Camarão|Frango à Zambeziana|Feijoada|Matapa de Siri|Badjias` },
  { continent: 'Africa', country: 'Nigeria', dishes: `Jollof Rice|Fried Rice|Egusi Soup|Ogbono Soup|Pepper Soup|Efo Riro|Afang Soup|Okra Soup|Bitterleaf Soup|Moi Moi|Akara|Suya|Pounded Yam|Amala|Eba|Fufu|Tuwo Shinkafa|Ofada Rice|Beans and Plantain|Puff-Puff|Chin Chin|Meat Pie` },
  { continent: 'Africa', country: 'Senegal', dishes: `Thieboudienne|Yassa Poulet|Yassa Poisson|Mafé|Ceebu Yapp|Soupou Kandia|Thiou|Fataya|Pastels|Accara|Thiakry|Ngalakh` },
  { continent: 'Africa', country: 'South Africa', dishes: `Bobotie|Bunny Chow|Boerewors|Potjiekos|Biltong|Chakalaka|Malva Pudding|Koeksisters|Vetkoek|Pap|Samp and Beans|Cape Malay Curry|Waterblommetjie Bredie|Gatsby|Sosatie|Milk Tart` },
  { continent: 'Africa', country: 'Tanzania', dishes: `Pilau|Ugali|Chipsi Mayai|Nyama Choma|Mishkaki|Wali wa Nazi|Zanzibar Pizza|Chapati|Ndizi Kaanga|Mchicha|Mandazi|Vitumbua|Urojo` },
  { continent: 'Africa', country: 'Uganda', dishes: `Matoke|Luwombo|Rolex|Posho|Groundnut Sauce|Katogo|Chapati|Muchomo|Mandazi|Nsenene|G-nut Soup` },

  { continent: 'Asia', country: 'Afghanistan', dishes: `Kabuli Pulao|Mantu|Ashak|Bolani|Qabili Palau|Korma|Shorwa|Borani Banjan|Borani Kadoo|Bolani Katchalu|Firni|Sheer Yakh` },
  { continent: 'Asia', country: 'Bangladesh', dishes: `Kacchi Biryani|Tehari|Bhuna Khichuri|Panta Bhat|Hilsa Curry|Shorshe Ilish|Chingri Malai Curry|Beef Bhuna|Chicken Rezala|Dhaka-style Haleem|Fuchka|Chotpoti|Singara|Beguni|Rasgulla|Mishti Doi|Sandesh` },
  { continent: 'Asia', country: 'Bhutan', dishes: `Ema Datshi|Kewa Datshi|Shakam Paa|Phaksha Paa|Jasha Maroo|Hoentay|Momos|Red Rice|Suja|Ara` },
  { continent: 'Asia', country: 'Cambodia', dishes: `Amok Trey|Beef Lok Lak|Kuy Teav|Bai Sach Chrouk|Nom Banh Chok|Samlor Korko|Samlor Machu|Prahok Ktis|Cha Kroeung|Num Pang|Kuy Teav Phnom Penh|Nom Ansom` },
  { continent: 'Asia', country: 'China', dishes: `Peking Duck|Kung Pao Chicken|Mapo Tofu|Sweet and Sour Pork|Char Siu|Chow Mein|Yangzhou Fried Rice|Egg Fried Rice|Hot Pot|Xiaolongbao|Baozi|Jiaozi|Wonton|Spring Rolls|Dan Dan Noodles|Zhajiangmian|Biang Biang Noodles|Lanzhou Beef Noodles|Hot and Sour Soup|Wonton Soup|Kung Pao Shrimp|Twice-Cooked Pork|Sichuan Boiled Fish|Dongpo Pork|Beggar's Chicken|General Tso's Chicken|Mongolian Beef|Orange Chicken|Ma Po Eggplant|Congee|Mooncake|Tangyuan|Zongzi` },
  { continent: 'Asia', country: 'India', region: 'Arunachal Pradesh', dishes: `Thukpa|Momos|Zan|Gyapa Khazi|Pika Pila|Chura Sabji|Apong|Lukter|Marua|Pehak` },
  { continent: 'Asia', country: 'India', region: 'Assam', dishes: `Khar|Masor Tenga|Duck Curry|Chicken Khorika|Aloo Pitika|Baingan Pitika|Xaak Bhaji|Ou Tenga|Pitha|Til Pitha|Ghila Pitha|Narikolor Laru|Jolpan|Duck with Kumura` },
  { continent: 'Asia', country: 'India', region: 'Bihar', dishes: `Litti Chokha|Sattu Paratha|Dal Pitha|Thekua|Khaja|Malpua|Chana Ghugni|Sattu Sharbat|Makhana Kheer|Bihari Kabab|Champaran Meat|Kadhi Badi|Dal Puri` },
  { continent: 'Asia', country: 'India', region: 'Chhattisgarh', dishes: `Fara|Chila|Muthiya|Aamat|Dubki Kadhi|Bafauri|Dehati Bada|Angakar Roti|Khurmi|Gulgula|Arsa` },
  { continent: 'Asia', country: 'India', region: 'Goa', dishes: `Goan Fish Curry|Prawn Balchão|Chicken Xacuti|Pork Vindaloo|Sorpotel|Cafreal|Recheado Fish|Ambot Tik|Prawn Curry|Feijoada|Bebinca|Dodol|Sanna|Poi|Ros Omelette` },
  { continent: 'Asia', country: 'India', region: 'Gujarat', dishes: `Dhokla|Khandvi|Thepla|Fafda|Jalebi|Undhiyu|Handvo|Khakhra|Patra|Kachori|Sev Tameta|Dal Dhokli|Gujarati Kadhi|Dal|Farsan|Mohanthal|Basundi|Shrikhand` },
  { continent: 'Asia', country: 'India', region: 'Haryana', dishes: `Bajra Khichdi|Bajra Roti|Missi Roti|Kadhi Pakora|Churma|Bathua Raita|Kachri Sabzi|Singri Sabzi|Besan Masala Roti|Meethe Chawal` },
  { continent: 'Asia', country: 'India', region: 'Himachal Pradesh', dishes: `Dham|Chana Madra|Rajma Madra|Kullu Trout|Siddu|Babru|Tudkiya Bhath|Sepu Vadi|Patrode|Mittha|Bhey|Aktori` },
  { continent: 'Asia', country: 'India', region: 'Jharkhand', dishes: `Dhuska|Rugra|Chilka Roti|Thekua|Pittha|Malpua|Litti|Bamboo Shoot Curry|Arsa Roti|Handia` },
  { continent: 'Asia', country: 'India', region: 'Karnataka', dishes: `Bisi Bele Bath|Mysore Masala Dosa|Ragi Mudde|Neer Dosa|Set Dosa|Akki Roti|Maddur Vada|Mangalore Buns|Mangalore Bajji|Vangi Bath|Puliyogare|Kosambari|Saaru|Majjige Huli|Obbattu|Mysore Pak|Dharwad Peda|Chiroti|Gojju` },
  { continent: 'Asia', country: 'India', region: 'Kashmir', dishes: `Rogan Josh|Yakhni|Gushtaba|Rista|Tabak Maaz|Dum Aloo|Haak|Nadru Yakhni|Modur Pulao|Kashmiri Pulao|Kahwa|Sheer Chai|Kaladi Kulcha` },
  { continent: 'Asia', country: 'India', region: 'Kerala', dishes: `Kerala Parotta|Appam|Puttu|Idiyappam|Malabar Biryani|Thalassery Biryani|Kerala Fish Curry|Meen Moilee|Karimeen Pollichathu|Beef Fry|Chicken Stew|Vegetable Stew|Avial|Thoran|Olan|Erissery|Kalan|Pachadi|Theeyal|Sambar|Rasam|Pulissery|Parippu Curry|Sadya|Payasam|Unniyappam|Neyyappam|Pazham Pori|Achappam|Banana Chips` },
  { continent: 'Asia', country: 'India', region: 'Madhya Pradesh', dishes: `Poha|Bhutte Ka Kees|Dal Bafla|Sabudana Khichdi|Mawa Bati|Chakki Ki Shaak|Bhopali Gosht Korma|Seekh Kabab|Bafla|Jalebi|Malpua|Ratlami Sev` },
  { continent: 'Asia', country: 'India', region: 'Maharashtra', dishes: `Vada Pav|Misal Pav|Pav Bhaji|Poha|Sabudana Khichdi|Sabudana Vada|Thalipeeth|Puran Poli|Bhakri|Bharli Vangi|Kolhapuri Chicken|Kolhapuri Mutton|Saoji Chicken|Misal|Kothimbir Vadi|Batata Vada|Kanda Bhaji|Modak|Shrikhand|Basundi|Pithla Bhakri` },
  { continent: 'Asia', country: 'India', region: 'Manipur', dishes: `Eromba|Singju|Chamthong|Kangshoi|Morok Metpa|Paknam|Ooti|Nga Thongba|Chagem Pomba|Chak Hao Kheer` },
  { continent: 'Asia', country: 'India', region: 'Meghalaya', dishes: `Jadoh|Dohneiihong|Dohkhlieh|Tungrymbai|Nakham Bitchi|Pukhlein|Minil Songa|Bamboo Shoot Curry` },
  { continent: 'Asia', country: 'India', region: 'Mizoram', dishes: `Bai|Sawhchiar|Vawksa Rep|Misa Mach Poora|Chhum Han|Bekang|Bamboo Shoot Fry` },
  { continent: 'Asia', country: 'India', region: 'Nagaland', dishes: `Smoked Pork with Bamboo Shoot|Pork with Axone|Galho|Akibiye|Hinkejvu|Axone Chutney|Fish with Bamboo Shoot|Naga Pork Curry|Fermented Soybean Chutney` },
  { continent: 'Asia', country: 'India', region: 'Odisha', dishes: `Dalma|Pakhala Bhata|Santula|Dahi Pakhala|Chhena Poda|Chhena Gaja|Rasabali|Khaja|Macha Ghanta|Besara|Kanika|Dal Jma|Puri Mahaprasad|Bara|Dahibara Aloodum` },
  { continent: 'Asia', country: 'India', region: 'Punjab', dishes: `Butter Chicken|Tandoori Chicken|Amritsari Fish|Chole Bhature|Rajma Chawal|Sarson Saag|Makki di Roti|Dal Makhani|Chana Masala|Paneer Tikka|Paneer Butter Masala|Aloo Paratha|Gobhi Paratha|Amritsari Kulcha|Chole|Kadhi Pakora|Lassi|Jalebi|Pinni|Gajar Halwa` },
  { continent: 'Asia', country: 'India', region: 'Rajasthan', dishes: `Dal Baati Churma|Gatte Ki Sabzi|Ker Sangri|Laal Maas|Safed Maas|Bajre Ki Roti|Pyaaz Kachori|Mawa Kachori|Mirchi Bada|Ghevar|Mohanthal|Rabri|Kalmi Vada|Papad Ki Sabzi|Panchmel Dal` },
  { continent: 'Asia', country: 'India', region: 'Sikkim', dishes: `Momos|Thukpa|Phagshapa|Gundruk|Kinema|Sel Roti|Chhurpi|Sha Phalley|Chhurpi Soup` },
  { continent: 'Asia', country: 'India', region: 'Sindh', dishes: `Sindhi Biryani|Sindhi Kadhi|Sai Bhaji|Dal Pakwan|Koki|Seyal Mani|Bhugal Bhaji|Taryal Patata|Aloo Tuk|Sindhi Curry` },
  { continent: 'Asia', country: 'India', region: 'Tamil Nadu', dishes: `Idli|Dosa|Masala Dosa|Rava Dosa|Adai|Paniyaram|Kuzhi Paniyaram|Ven Pongal|Sakkarai Pongal|Kanchipuram Idli|Appam|Idiyappam|Parotta|Kothu Parotta|Kal Dosa|Kari Dosa|Uttapam|Pongal|Upma|Lemon Rice|Tamarind Rice|Coconut Rice|Curd Rice|Tomato Rice|Sambar|Rasam|Vatha Kuzhambu|Mor Kuzhambu|Puli Kuzhambu|Kara Kuzhambu|Avial|Poriyal|Kootu|Keerai Masiyal|Paruppu Usili|Chicken Chettinad|Mutton Chukka|Chettinad Mutton|Chettinad Fish|Meen Kuzhambu|Meen Varuval|Nandu Rasam|Mutton Biryani|Ambur Biryani|Dindigul Biryani|Thanjavur Biryani|Kongunadu Chicken|Kongunadu Mutton|Jigarthanda|Filter Coffee|Payasam|Adhirasam|Mysore Pak|Jangiri|Murukku|Thattai|Seedai|Thenkuzhal|Ribbon Pakoda|Mixture|Kozhukattai|Modakam|Sundal` },
  { continent: 'Asia', country: 'India', region: 'Telangana', dishes: `Hyderabadi Biryani|Hyderabadi Haleem|Mirchi Ka Salan|Bagara Baingan|Double Ka Meetha|Qubani Ka Meetha|Osmania Biscuit|Sarva Pindi|Sakinalu|Garelu|Kodi Kura|Gongura Mutton|Hyderabadi Marag` },
  { continent: 'Asia', country: 'India', region: 'Tripura', dishes: `Mui Borok|Chakhwi|Gudok|Mosdeng Serma|Wahan Mosdeng|Awandru|Bhangui` },
  { continent: 'Asia', country: 'India', region: 'Uttar Pradesh', dishes: `Awadhi Biryani|Galouti Kebab|Kakori Kebab|Tunday Kebab|Nihari|Lucknowi Korma|Awadhi Korma|Bedmi Puri|Aloo Sabzi|Kachori|Banarasi Chaat|Banarasi Tamatar Chaat|Basket Chaat|Dahi Vada|Malaiyo|Banarasi Paan|Gujiya|Peda|Balushahi|Imarti` },
  { continent: 'Asia', country: 'India', region: 'Uttarakhand', dishes: `Kafuli|Aloo Ke Gutke|Phaanu|Chainsoo|Bhatt Ki Churkani|Kandalee Ka Saag|Jhangora Ki Kheer|Singori|Bal Mithai|Dubke|Badi` },
  { continent: 'Asia', country: 'India', region: 'West Bengal', dishes: `Macher Jhol|Shorshe Ilish|Kosha Mangsho|Chicken Rezala|Mutton Rezala|Chingri Malai Curry|Aloo Posto|Shukto|Luchi|Kochuri|Begun Bhaja|Mishti Doi|Rasgulla|Sandesh|Rajbhog|Langcha|Cham Cham|Patishapta|Payesh|Dhokar Dalna|Cholar Dal|Bengali Khichuri` },
  { continent: 'Asia', country: 'Indonesia', dishes: `Nasi Goreng|Nasi Padang|Rendang|Ayam Goreng|Ayam Bakar|Ayam Betutu|Gado-Gado|Satay|Beef Satay|Chicken Satay|Soto Ayam|Soto Betawi|Bakso|Mie Goreng|Mie Ayam|Nasi Uduk|Nasi Kuning|Gudeg|Rawon|Opor Ayam|Beef Semur|Sambal|Tempeh Goreng|Pisang Goreng|Martabak|Klepon` },
  { continent: 'Asia', country: 'Japan', dishes: `Sushi|Sashimi|Nigiri|Maki|Temaki|Ramen|Udon|Soba|Yakisoba|Tempura|Teriyaki|Yakitori|Tonkatsu|Katsudon|Oyakodon|Gyudon|Unadon|Curry Rice|Omurice|Okonomiyaki|Takoyaki|Gyoza|Shabu-Shabu|Sukiyaki|Miso Soup|Chawanmushi|Onigiri|Tamagoyaki|Donburi|Mochi|Dorayaki|Taiyaki|Matcha Parfait` },
  { continent: 'Asia', country: 'Korea', dishes: `Kimchi|Kimchi Jjigae|Bibimbap|Bulgogi|Galbi|Japchae|Tteokbokki|Kimbap|Samgyeopsal|Sundubu Jjigae|Doenjang Jjigae|Samgyetang|Haemul Pajeon|Mandu|Naengmyeon|Jajangmyeon|Dakgalbi|Korean Fried Chicken|Bossam|Jokbal|Hotteok|Bingsu` },
  { continent: 'Asia', country: 'Laos', dishes: `Laap|Khao Poon|Khao Niew|Tam Mak Hoong|Or Lam|Mok Pa|Ping Kai|Sai Oua|Nam Khao|Khao Piak Sen|Jeow Bong|Khao Tom` },
  { continent: 'Asia', country: 'Malaysia', dishes: `Nasi Lemak|Char Kway Teow|Laksa|Curry Laksa|Assam Laksa|Roti Canai|Nasi Kandar|Hainanese Chicken Rice|Beef Rendang|Ayam Percik|Satay|Mee Goreng|Nasi Goreng Kampung|Roti Jala|Char Siu|Bak Kut Teh|Sambal|Kuih|Cendol|Apam Balik` },
  { continent: 'Asia', country: 'Myanmar', dishes: `Mohinga|Shan Noodles|Burmese Curry|Laphet Thoke|Ohn No Khao Swe|Nan Gyi Thoke|Burmese Tea Leaf Salad|Mont Lin Ma Yar|Shan Tofu|Samusa|Palata|Kyay Oh` },
  { continent: 'Asia', country: 'Nepal', dishes: `Dal Bhat|Momo|Thukpa|Sel Roti|Gundruk|Gundruk Ko Jhol|Aloo Tama|Chatamari|Yomari|Thenthuk|Sekuwa|Choila|Kwati|Dhido` },
  { continent: 'Asia', country: 'Pakistan', dishes: `Biryani|Nihari|Haleem|Chicken Karahi|Mutton Karahi|Beef Karahi|Chicken Handi|Seekh Kebab|Chapli Kebab|Shami Kebab|Peshawari Naan|Aloo Paratha|Keema|Saag|Chana Masala|Daal|Paya|Sajji|Bun Kebab|Samosa|Pakora|Jalebi|Gulab Jamun|Kheer|Gajar Halwa|Ras Malai` },
  { continent: 'Asia', country: 'Philippines', dishes: `Adobo|Sinigang|Lechon|Kare-Kare|Pancit|Lumpia|Sisig|Chicken Inasal|Tapsilog|Longsilog|Bangsilog|Arroz Caldo|Tinola|Bulalo|Menudo|Caldereta|Laing|Dinuguan|Bicol Express|Halo-Halo|Bibingka|Leche Flan|Turon` },
  { continent: 'Asia', country: 'Singapore', dishes: `Hainanese Chicken Rice|Laksa|Chilli Crab|Black Pepper Crab|Char Kway Teow|Hokkien Mee|Nasi Lemak|Kaya Toast|Bak Kut Teh|Roti Prata|Chicken Satay|Fish Head Curry|Mee Siam|Nasi Goreng` },
  { continent: 'Asia', country: 'Sri Lanka', dishes: `Rice and Curry|Kottu Roti|Hoppers|String Hoppers|Pol Sambol|Dhal Curry|Fish Ambul Thiyal|Chicken Curry|Jaffna Crab Curry|Lamprais|Watalappam|Pol Roti|Pittu|Kiribath|Parippu|Gotu Kola Sambol|Devilled Chicken|Egg Hoppers|Isso Wade` },
  { continent: 'Asia', country: 'Taiwan', dishes: `Beef Noodle Soup|Gua Bao|Lu Rou Fan|Three Cup Chicken|Oyster Omelette|Scallion Pancake|Beef Rolls|Dan Bing|Taiwanese Fried Chicken|Stinky Tofu|Hot Pot|Braised Pork Rice|Pineapple Cake|Bubble Tea` },
  { continent: 'Asia', country: 'Thailand', dishes: `Pad Thai|Green Curry|Red Curry|Massaman Curry|Panang Curry|Tom Yum|Tom Kha Gai|Som Tam|Pad Kra Pao|Khao Pad|Khao Soi|Pad See Ew|Pad Kee Mao|Thai Basil Chicken|Mango Sticky Rice|Satay|Tod Mun Pla|Larb|Green Papaya Salad|Boat Noodles|Thai Coconut Soup` },
  { continent: 'Asia', country: 'Turkey', dishes: `Döner|Kebab|Adana Kebab|Şiş Kebab|İskender Kebab|Lahmacun|Pide|Menemen|Manti|Köfte|Mercimek Çorbası|Imam Bayildi|Karnıyarık|Dolma|Sarma|Börek|Gözleme|Meze|Baklava|Lokum|Künefe|Sütlaç` },

  { continent: 'Europe', country: 'Italy', dishes: `Pizza Margherita|Pizza Marinara|Lasagna|Spaghetti Bolognese|Spaghetti Carbonara|Cacio e Pepe|Amatriciana|Arrabbiata|Pesto Genovese|Risotto|Risotto alla Milanese|Gnocchi|Ravioli|Tortellini|Fettuccine Alfredo|Penne alla Vodka|Osso Buco|Chicken Parmigiana|Eggplant Parmigiana|Minestrone|Caprese Salad|Bruschetta|Arancini|Focaccia|Polenta|Tiramisu|Panna Cotta|Cannoli|Sfogliatelle|Panettone|Gelato` },
  { continent: 'Europe', country: 'France', dishes: `Ratatouille|Coq au Vin|Beef Bourguignon|Bouillabaisse|Cassoulet|Croque Monsieur|Croque Madame|Quiche Lorraine|French Onion Soup|Escargots|Confit de Canard|Duck à l'Orange|Steak Frites|Crêpes|Galette|Soufflé|Gratin Dauphinois|Beef Tartare|Nicoise Salad|Baguette|Croissant|Pain au Chocolat|Macarons|Crème Brûlée|Éclair|Mille-Feuille|Tarte Tatin|Profiteroles` },
  { continent: 'Europe', country: 'Spain', dishes: `Paella|Paella Valenciana|Paella de Marisco|Tortilla Española|Gazpacho|Salmorejo|Patatas Bravas|Croquetas|Gambas al Ajillo|Pulpo a la Gallega|Churros|Empanada Gallega|Fabada Asturiana|Cocido|Albondigas|Pisto|Calamares|Jamón|Pan Con Tomate|Crema Catalana` },
  { continent: 'Europe', country: 'Greece', dishes: `Moussaka|Souvlaki|Gyros|Tzatziki|Greek Salad|Spanakopita|Tiropita|Pastitsio|Dolmades|Fasolada|Gemista|Avgolemono|Kleftiko|Stifado|Baklava|Loukoumades|Galaktoboureko` },
  { continent: 'Europe', country: 'Germany', dishes: `Bratwurst|Currywurst|Schnitzel|Sauerbraten|Rouladen|Bratkartoffeln|Kartoffelpuffer|Sauerkraut|Eisbein|Schweinshaxe|Spätzle|Maultaschen|Pretzel|Black Forest Cake|Stollen|Apfelstrudel` },
  { continent: 'Europe', country: 'United Kingdom', dishes: `Fish and Chips|Shepherd's Pie|Cottage Pie|Sunday Roast|Beef Wellington|Bangers and Mash|Steak and Kidney Pie|Cornish Pasty|Scotch Egg|Toad in the Hole|Yorkshire Pudding|Full English Breakfast|Welsh Rarebit|Chicken Tikka Masala|Ploughman's Lunch|Eton Mess|Sticky Toffee Pudding|Christmas Pudding|Trifle|Victoria Sponge` },
  { continent: 'Europe', country: 'Portugal', dishes: `Bacalhau|Bacalhau à Brás|Caldo Verde|Francesinha|Pastéis de Nata|Cozido|Arroz de Marisco|Cataplana|Bifana|Polvo à Lagareiro|Sardinhas Assadas|Feijoada|Bola de Berlim` },
  { continent: 'Europe', country: 'Austria', dishes: `Wiener Schnitzel|Tafelspitz|Goulash|Kaiserschmarrn|Apfelstrudel|Sachertorte|Knödel|Wiener Würstchen|Käsespätzle` },
  { continent: 'Europe', country: 'Belgium', dishes: `Moules-Frites|Carbonnade Flamande|Waterzooi|Belgian Waffles|Stoemp|Croquettes|Liège Waffle|Speculoos|Belgian Chocolate` },
  { continent: 'Europe', country: 'Czechia', dishes: `Goulash|Svíčková|Vepřo Knedlo Zelo|Bramboráky|Kulajda|Knedlíky|Trdelník|Kolache` },
  { continent: 'Europe', country: 'Hungary', dishes: `Goulash|Chicken Paprikash|Pörkölt|Fisherman's Soup|Lángos|Stuffed Cabbage|Dobos Torte|Somlói Galuska|Kürtőskalács` },
  { continent: 'Europe', country: 'Poland', dishes: `Pierogi|Bigos|Żurek|Barszcz|Gołąbki|Placki Ziemniaczane|Kielbasa|Kotlet Schabowy|Zapiekanka|Paczki|Makowiec` },
  { continent: 'Europe', country: 'Russia', dishes: `Beef Stroganoff|Borscht|Pelmeni|Blini|Olivier Salad|Chicken Kiev|Shchi|Solyanka|Pirozhki|Beef Kotleti|Syrniki|Medovik` },
  { continent: 'Europe', country: 'Ukraine', dishes: `Borscht|Varenyky|Holubtsi|Deruny|Salo|Chicken Kyiv|Banosh|Pampushki|Syrniki|Kutia` },
  { continent: 'Europe', country: 'Switzerland', dishes: `Fondue|Raclette|Rösti|Zürcher Geschnetzeltes|Älplermagronen|Birchermüesli|Bündnerfleisch|Basler Läckerli` },

  { continent: 'Middle East & North Africa', country: 'Egypt', dishes: `Koshari|Ful Medames|Ta'meya|Molokhia|Fattah|Hamam Mahshi|Mahshi|Hawawshi|Feteer Meshaltet|Roz Bel Laban|Basbousa|Umm Ali|Kunafa` },
  { continent: 'Middle East & North Africa', country: 'Iran', dishes: `Chelo Kebab|Ghormeh Sabzi|Fesenjan|Zereshk Polo|Tahdig|Baghali Polo|Abgoosht|Ash Reshteh|Khoresht Gheimeh|Mirza Ghasemi|Kashk-e Bademjan|Kuku Sabzi|Shirazi Salad|Saffron Ice Cream|Faloodeh` },
  { continent: 'Middle East & North Africa', country: 'Lebanon', dishes: `Hummus|Baba Ganoush|Tabbouleh|Fattoush|Kibbeh|Falafel|Shawarma|Manakish|Kafta|Shish Taouk|Mujadara|Warak Enab|Batata Harra|Baklava|Maamoul` },
  { continent: 'Middle East & North Africa', country: 'Israel', dishes: `Shakshuka|Falafel|Hummus|Sabich|Israeli Salad|Challah|Bourekas|Jachnun|Malawach|Kubbeh|Latkes|Rugelach|Halva` },
  { continent: 'Middle East & North Africa', country: 'Jordan', dishes: `Mansaf|Maqluba|Musakhan|Falafel|Hummus|Maglouba|Zarb|Makmoura|Galayet Bandora|Knafeh` },
  { continent: 'Middle East & North Africa', country: 'Palestine', dishes: `Musakhan|Maqluba|Maftoul|Qidreh|Sumagiyya|Fatteh|Falafel|Hummus|Baba Ghanoush|Kanafeh|Qatayef|Ma'amoul` },
  { continent: 'Middle East & North Africa', country: 'Syria', dishes: `Kibbeh|Fatteh|Shawarma|Muhammara|Fattoush|Tabbouleh|Yalanji|Shish Barak|Mahshi|Mujaddara|Baklava|Maamoul` },
  { continent: 'Middle East & North Africa', country: 'Iraq', dishes: `Masgouf|Dolma|Kubba|Tashreeb|Quzi|Tepsi Baytinijan|Biryani Iraqi|Kebab|Kleicha|Masgouf` },
  { continent: 'Middle East & North Africa', country: 'Tunisia', dishes: `Couscous|Brik|Shakshuka|Lablabi|Ojja|Harissa|Mechouia Salad|Fricassé|Makroudh|Bambalouni` },
  { continent: 'Middle East & North Africa', country: 'Algeria', dishes: `Couscous|Chorba|Rechta|Chakhchoukha|Mhadjeb|Dolma|Tajine Zitoune|Kesra|Bourek|Makroud` },
  { continent: 'Middle East & North Africa', country: 'Libya', dishes: `Bazin|Shakshuka|Couscous|Mbakbaka|Asida|Usban|Shorba|Batata Mubattana` },
  { continent: 'Middle East & North Africa', country: 'Yemen', dishes: `Mandi|Saltah|Fahsa|Zurbian|Aseeda|Shafout|Bint Al-Sahn|Mutabbaq|Malooga` },
  { continent: 'Middle East & North Africa', country: 'Gulf / Khaleeji', dishes: `Kabsa|Machboos|Mandi|Harees|Thareed|Majboos|Saleeg|Jareesh|Mutabbaq|Balaleet|Luqaimat|Khabeesa|Madrouba|Saloona` },

  { continent: 'North America', country: 'Mexico', dishes: `Tacos|Tacos al Pastor|Carnitas|Barbacoa|Birria|Enchiladas|Quesadillas|Burritos|Tamales|Chiles Rellenos|Pozole|Menudo|Mole Poblano|Mole Negro|Tostadas|Nachos|Guacamole|Elote|Esquites|Chilaquiles|Huevos Rancheros|Flautas|Sopes|Gorditas|Empanadas|Tres Leches Cake|Churros|Flan` },
  { continent: 'North America', country: 'Canada', dishes: `Poutine|Tourtière|Montreal Smoked Meat Sandwich|Nanaimo Bars|Butter Tarts|Bannock|Peameal Bacon Sandwich|Halifax Donair|Montreal Bagels|Split Pea Soup|Maple Taffy` },
  { continent: 'North America', country: 'United States', dishes: `Hamburger|Cheeseburger|Hot Dog|Fried Chicken|BBQ Ribs|Pulled Pork|Brisket|Mac and Cheese|Clam Chowder|Gumbo|Jambalaya|Crawfish Étouffée|Po' Boy|Philly Cheesesteak|Buffalo Wings|Cornbread|Biscuits and Gravy|Pancakes|Waffles|Apple Pie|Pecan Pie|Pumpkin Pie|Cheesecake|Brownies|Donuts|Key Lime Pie` },
  { continent: 'North America', country: 'Caribbean', dishes: `Jerk Chicken|Jamaican Curry Goat|Jamaican Patties|Ackee and Saltfish|Rice and Peas|Oxtail Stew|Callaloo|Roti|Doubles|Pelau|Cou Cou|Flying Fish|Pepperpot|Conch Fritters|Fritters|Caribbean Fish Curry|Goat Water|Rundown|Rice and Beans` },
  { continent: 'North America', country: 'Guatemala', region: 'Central America', dishes: `Pepian|Kak'ik|Fiambre|Tamales|Chiles Rellenos|Pupusas|Rellenitos` },
  { continent: 'North America', country: 'El Salvador', region: 'Central America', dishes: `Pupusas|Yuca Frita|Curtido|Pastelitos|Sopa de Res|Tamales` },
  { continent: 'North America', country: 'Honduras', region: 'Central America', dishes: `Baleadas|Sopa de Caracol|Plato Típico|Pastelitos|Tamales|Carne Asada` },
  { continent: 'North America', country: 'Nicaragua', region: 'Central America', dishes: `Gallo Pinto|Nacatamales|Vigorón|Indio Viejo|Quesillo|Sopa de Mondongo` },
  { continent: 'North America', country: 'Costa Rica', region: 'Central America', dishes: `Gallo Pinto|Casado|Olla de Carne|Chifrijo|Tamales|Arroz con Pollo|Ceviche` },
  { continent: 'North America', country: 'Panama', region: 'Central America', dishes: `Sancocho|Arroz con Pollo|Ropa Vieja|Carimañolas|Patacones|Hojaldres|Tamales` },

  { continent: 'South America', country: 'Argentina', dishes: `Asado|Empanadas|Choripán|Milanesa|Locro|Humita|Provoleta|Carbonada|Matambre|Chimichurri|Alfajores|Dulce de Leche|Chocotorta` },
  { continent: 'South America', country: 'Bolivia', dishes: `Salteñas|Pique Macho|Silpancho|Sopa de Maní|Fritanga|Llajwa|Sajta de Pollo|Chairo|Api|Tucumanas` },
  { continent: 'South America', country: 'Brazil', dishes: `Feijoada|Coxinha|Pão de Queijo|Moqueca|Acarajé|Vatapá|Farofa|Brigadeiro|Pastel|Churrasco|Picanha|Bobó de Camarão|Carne de Sol|Baião de Dois|Tapioca|Canjica` },
  { continent: 'South America', country: 'Chile', dishes: `Empanadas|Pastel de Choclo|Cazuela|Completo|Asado|Curanto|Humitas|Sopaipillas|Pebre|Leche Asada` },
  { continent: 'South America', country: 'Colombia', dishes: `Bandeja Paisa|Arepas|Ajiaco|Sancocho|Empanadas|Tamales|Lechona|Changua|Mondongo|Patacones|Arroz de Coco|Buñuelos|Natilla` },
  { continent: 'South America', country: 'Ecuador', dishes: `Ceviche|Fanesca|Llapingachos|Locro de Papa|Encebollado|Hornado|Fritada|Seco de Chivo|Bolón de Verde|Empanadas de Viento|Guatita` },
  { continent: 'South America', country: 'Peru', dishes: `Ceviche|Lomo Saltado|Ají de Gallina|Anticuchos|Pollo a la Brasa|Causa|Papa a la Huancaína|Arroz con Pollo|Seco de Carne|Tacu Tacu|Arroz Chaufa|Tallarines Saltados|Rocoto Relleno|Pachamanca|Juane|Chupe de Camarones|Tiradito|Suspiro a la Limeña|Picarones` },
  { continent: 'South America', country: 'Uruguay', dishes: `Chivito|Asado|Choripán|Milanesa|Empanadas|Pascualina|Fainá|Matambre|Pizza Uruguaya|Alfajores|Dulce de Leche` },
  { continent: 'South America', country: 'Venezuela', dishes: `Arepas|Pabellón Criollo|Hallacas|Cachapas|Tequeños|Empanadas|Asado Negro|Pisca Andina|Reina Pepiada|Patacones|Perico|Quesillo|Tres Leches` },

  { continent: 'Oceania', country: 'Australia', dishes: `Meat Pie|Sausage Roll|Chicken Parmigiana|Fish and Chips|Barramundi|Lamington|Pavlova|Anzac Biscuits|Fairy Bread|Damper|Vegemite Toast|Tim Tam|Kangaroo Steak` },
  { continent: 'Oceania', country: 'New Zealand', dishes: `Hāngi|Meat Pie|Fish and Chips|Pavlova|Hokey Pokey|Anzac Biscuits|Whitebait Fritters|Lolly Cake|Mince on Toast|Sausage Rolls` },
  { continent: 'Oceania', country: 'Pacific Islands', dishes: `Palusami|Lovo|Kokoda|Ota Ika|Poi|Lu Pulu|Sapasui|Tarakihi|Coconut Crab|Taro Pudding` },
  { continent: 'Oceania', country: 'Polynesia', dishes: `Kalua Pig|Poke|Lau Lau|Lomi Lomi Salmon|Poi|Hāngi|Palusami|Oka|Faiai|Coconut Bread` },
];

const slugify = (value) => value.normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');

const dessertWords = [
  'cake', 'pie', 'pudding', 'tart', 'ice cream', 'parfait', 'chocolate', 'halwa', 'kheer', 'payasam',
  'laddu', 'ladoo', 'jalebi', 'gulab jamun', 'rasgulla', 'ras malai', 'sandesh', 'mishti doi', 'peda', 'mysore pak',
  'adhirasam', 'malpua', 'sheera', 'puran poli', 'pooran poli', 'gujiya', 'karanji', 'modak', 'kozhukattai',
  'neyyappam', 'unniyappam', 'ghevar', 'rabri', 'basundi', 'shrikhand', 'chhena poda', 'chhena gaja', 'rasabali',
  'patishapta', 'payesh', 'double ka meetha', 'qubani ka meetha', 'balushahi', 'imarti', 'jhangora ki kheer',
  'bal mithai', 'bebinca', 'dodol', 'pinni', 'petha', 'pootharekulu', 'ariselu', 'thekua', 'khaja', 'churma',
  'mittha', 'obbattu', 'dharwad peda', 'chiroti', 'mochi', 'dorayaki', 'taiyaki', 'matcha parfait', 'hotteok',
  'bingsu', 'klepon', 'pisang goreng', 'cendol', 'kuih', 'halo-halo', 'bibingka', 'leche flan', 'watalappam',
  'pineapple cake', 'moon(cake)', 'tangyuan', 'sütlaç', 'baklava', 'kunafa', 'knafeh', 'kanafeh', 'qatayef',
  'maamoul', 'ma\'amoul', 'kleicha', 'lokum', 'bint al-sahn', 'luqaimat', 'khabeesa', 'faloodeh', 'saffron ice cream',
  'malva pudding', 'koeksisters', 'milk tart', 'bofrot', 'chin chin', 'mokary', 'koba', 'baghrir', 'chebakia',
  'sellou', 'pastéis de nata', 'bola de berlim', 'kaiserschmarrn', 'sachertorte', 'apfelstrudel', 'trdelník', 'kolache',
  'dobos torte', 'somlói galuska', 'kürtőskalács', 'paczki', 'makowiec', 'syrniki', 'medovik', 'kutia', 'nanaimo bars',
  'butter tarts', 'maple taffy', 'churros', 'tres leches', 'flan', 'alfajores', 'dulce de leche', 'chocotorta',
  'brigadeiro', 'canjica', 'leche asada', 'buñuelos', 'natilla', 'suspiro a la limeña', 'picarones', 'quesillo',
  'lamington', 'pavlova', 'anzac biscuits', 'tim tam', 'hokey pokey', 'lolly cake', 'taro pudding', 'panna cotta',
  'tiramisu', 'cannoli', 'sfogliatelle', 'panettone', 'gelato', 'macaron', 'crème brûlée', 'éclair', 'mille-feuille',
  'tarte tatin', 'profiteroles', 'churros', 'galaktoboureko', 'loukoumades', 'baklava', 'black forest cake', 'stollen',
  'apfelstrudel', 'eton mess', 'sticky toffee pudding', 'christmas pudding', 'trifle', 'victoria sponge', 'brownies',
  'donut', 'doughnut', 'apple pie', 'pecan pie', 'pumpkin pie', 'cheesecake', 'key lime pie', 'nanaimo', 'tres leches cake',
  'brigadeiro', 'pão de queijo', 'bint al-sahn', 'sheer yakh', 'firni', 'malaiyo', 'mango sticky rice', 'banarasi paan', 'paan', 'gajar halwa',
  'mohanthal', 'chhena', 'rasgulla', 'rajbhog', 'langcha', 'cham cham', 'gulgula', 'arsa', 'khurmi', 'koba'
];
const beverageWords = ['coffee', 'juice', 'sharbat', 'sherbet', 'drink', 'lassi', 'bubble tea', 'sobolo', 'suja', 'apong', 'ara', 'panakam', 'kahwa', 'sheer chai', 'chai', 'jigarthanda'];
const breadWords = ['roti', 'naan', 'paratha', 'parotta', 'chapati', 'bread', 'tortilla', 'bannock', 'pita', 'focaccia', 'baguette', 'croissant', 'brioche', 'pretzel', 'msemen', 'pide', 'lahmacun', 'manakish', 'flatbread', 'toast', 'pancake', 'waffle', 'crepe', 'crêpe', 'galette', 'buns', 'damper', 'fainá'];
const starterWords = ['soup', 'salad', 'sambusa', 'samosa', 'sambos', 'sambusa', 'sambusa', 'fritters', 'fritter', 'pakora', 'bhaji', 'chaat', 'puri', 'bruschetta', 'spring rolls', 'dumpling', 'momo', 'momos', 'wonton', 'sushi', 'sashimi', 'satay', 'yakitori', 'takoyaki', 'okonomiyaki', 'falafel', 'hummus', 'baba ganoush', 'dip', 'meze', 'meza', 'croquette', 'croquetas', 'empanada', 'pastelitos', 'fuchka', 'chotpoti', 'singara', 'beguni', 'bhel', 'sev puri', 'dahi puri', 'pani puri', 'kachori', 'vadas', 'vada', 'puff-puff', 'akara', 'moi moi', 'roll', 'wade', 'tikki', 'canape', 'canapes', 'brik', 'bourek', 'briouat', 'sambal', 'tostada', 'nachos', 'guacamole', 'elote', 'esquites', 'sopes', 'gorditas', 'patatas bravas', 'gambas', 'calamares', 'scotch egg', 'wings', 'bites', 'chicken lollipop', 'chilli paneer', 'gobi manchurian', 'chicken manchurian'];
const sideWords = ['chutney', 'sambol', 'raita', 'pickle', 'relish', 'fries', 'chips', 'papad', 'papadum', 'sauce', 'mashed', 'poriyal', 'thoran', 'kosambari', 'patatas bravas', 'curtido', 'chimichurri', 'farofa', 'pebre', 'chakalaka', 'sukuma wiki', 'sukuma', 'mchicha', 'xaak bhaji', 'sai bhaji'];
const snackWords = ['snack', 'chips', 'biscuit', 'cookie', 'cracker', 'popcorn', 'barfi', 'farsan', 'sev', 'mixture', 'murukku', 'thattai', 'seedai', 'thenkuzhal', 'ribbon pakoda', 'khakhra', 'khakhara', 'mathri', 'puff-puff', 'chin chin', 'biltong', 'bofrot', 'mandazi', 'samosa', 'pakora', 'bhajia', 'bhaji', 'kachori', 'vada pav', 'dabeli', 'misal pav', 'frankie', 'egg roll', 'kathi roll', 'momo', 'dumpling', 'street food', 'taco', 'tacos', 'samosa chaat', 'pizza samosa'];

function classifyDish(title) {
  const normalized = slugify(title).replaceAll('-', ' ');
  const hasPhrase = (words) => words.some((word) => {
    const phrase = slugify(word).replaceAll('-', ' ');
    return ` ${normalized} `.includes(` ${phrase} `);
  });
  if (hasPhrase(dessertWords)) return 'dessert';
  if (hasPhrase(beverageWords)) return 'beverage';
  if (hasPhrase(breadWords)) return 'bread';
  if (hasPhrase(sideWords)) return 'side';
  if (hasPhrase(starterWords)) return 'starter';
  if (hasPhrase(snackWords)) return 'snack';
  return 'main';
}

const indianRegions = regions.filter((region) => region.country === 'India');
const dishes = [];
for (const region of indianRegions) {
  for (const title of region.dishes.split('|').map((item) => item.trim()).filter(Boolean)) {
    dishes.push({ title, primary: region.country, regional: region.region || '', continent: region.continent });
  }
}

const uniqueDishes = [...new Map(dishes.map((dish) => [`${slugify(dish.title)}|${slugify(dish.primary)}|${slugify(dish.regional)}`, dish])).values()];

async function ensureCuisine(name, level, parentCuisine = null, continent = '') {
  const slug = slugify(name);
  return Cuisine.findOneAndUpdate(
    { slug },
    {
      $setOnInsert: {
        name,
        slug,
        level,
        parentCuisine,
        country: level === 'country' ? name : '',
        continent,
        description: `A names-only index of dishes associated with ${name}.`,
        status: 'active',
        isDemo: false,
        image: '',
      },
    },
    { upsert: true, new: true },
  ).select('_id name slug').lean();
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB_NAME || 'recipemaster' });

  const world = await ensureCuisine('World', 'world');
  const continentIds = new Map();
  const countryIds = new Map();

  for (const continentName of [...new Set(indianRegions.map((region) => region.continent))]) {
    continentIds.set(continentName, (await ensureCuisine(continentName, 'continent', world._id, continentName))._id);
  }
  for (const region of indianRegions) {
    const key = `${region.continent}|${region.country}`;
    if (!countryIds.has(key)) {
      const parentId = continentIds.get(region.continent);
      countryIds.set(key, (await ensureCuisine(region.country, 'country', parentId, region.continent))._id);
    }
    if (region.region) {
      await ensureCuisine(region.region, 'region', countryIds.get(key), region.continent);
    }
  }
  const operations = uniqueDishes.map((dish) => {
    const location = `${dish.primary}${dish.regional ? `-${dish.regional}` : ''}`;
    const slug = `catalog-${slugify(dish.title)}-${slugify(location)}`;
    return {
      updateOne: {
        filter: { slug },
        update: {
          $setOnInsert: {
            title: dish.title,
            slug,
            description: '',
            coverImage: { url: '', publicId: '', alt: '' },
            cuisine: { primary: dish.primary, regional: dish.regional },
            dishCategory: classifyDish(dish.title),
            catalogOnly: true,
            mealTypes: [],
            diet: [],
            servings: 2,
            ingredients: [],
            steps: [],
            tags: ['catalog-only'],
            status: 'published',
            visibility: 'public',
            reviewStatus: 'draft',
            source: 'original',
            isDemo: false,
          },
        },
        upsert: true,
      },
    };
  });

  let inserted = 0;
  let matched = 0;
  for (let index = 0; index < operations.length; index += 400) {
    const result = await Recipe.bulkWrite(operations.slice(index, index + 400), { ordered: false });
    inserted += result.upsertedCount;
    matched += result.matchedCount;
  }

  const categoryCounts = uniqueDishes.reduce((counts, dish) => {
    const category = classifyDish(dish.title);
    counts[category] = (counts[category] || 0) + 1;
    return counts;
  }, {});
  console.log(JSON.stringify({
    catalogEntries: uniqueDishes.length,
    inserted,
    alreadyPresent: matched,
    categories: categoryCounts,
    cuisineNodesEnsured: continentIds.size + countryIds.size + indianRegions.filter((region) => region.region).length + 1,
  }, null, 2));
}

try {
  await main();
} catch (error) {
  console.error('Dish catalog import failed:', error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
