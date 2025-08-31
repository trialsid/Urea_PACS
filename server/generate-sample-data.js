const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'urea_pacs.db');

// Indian farmer names and villages for realistic data
const firstNames = [
  'Rajesh', 'Suresh', 'Ramesh', 'Mahesh', 'Dinesh', 'Naresh', 'Ganesh', 'Mukesh',
  'Prakash', 'Vikash', 'Santosh', 'Ashok', 'Vinod', 'Manoj', 'Anil', 'Sunil',
  'Ravi', 'Ajay', 'Vijay', 'Sanjay', 'Deepak', 'Pawan', 'Rohan', 'Mohan',
  'Krishna', 'Govind', 'Anand', 'Pramod', 'Subhash', 'Rakesh', 'Lokesh', 'Yogesh',
  'Jitesh', 'Ritesh', 'Hitesh', 'Nitesh', 'Kamlesh', 'Ramakant', 'Jagdish', 'Harish',
  'Girish', 'Manish', 'Satish', 'Jagannath', 'Raghunath', 'Vishwanath', 'Dhananjay', 'Srinivas',
  'Balaram', 'Shyam', 'Ghanshyam', 'Radheshyam', 'Purushottam', 'Jagmohan', 'Sohan', 'Roshan',
  'Kishan', 'Darshan', 'Kailash', 'Subodh', 'Upendra', 'Mahendra', 'Narendra', 'Surendra',
  'Jitendra', 'Rajendra', 'Devendra', 'Dharmendra', 'Gajendra', 'Nagendra', 'Bhupendra', 'Virendra',
  'Pradeep', 'Sandeep', 'Kuldeep', 'Pardeep', 'Amardeep', 'Jasbir', 'Ranbir', 'Veer',
  'Dharmveer', 'Ranveer', 'Mahaveer', 'Balveer', 'Tejveer', 'Shivraj', 'Ramraj', 'Samrat',
  'Bharat', 'Sharat', 'Jagat', 'Hemant', 'Basant', 'Vasant', 'Shrikant', 'Jayant',
  'Anant', 'Vikrant', 'Amarjeet', 'Gurjeet', 'Harjeet', 'Manjeet', 'Ranjeet', 'Surjeet',
  'Indrajeet', 'Balwant', 'Jaswant', 'Mahant', 'Shantanu', 'Vishnu', 'Brahma', 'Shankar',
  'Omkar', 'Bhaskar', 'Diwakar', 'Avinash', 'Puneet', 'Sumeet', 'Naveen', 'Praveen',
  'Prem', 'Shubham', 'Uttam', 'Gautam', 'Pritam', 'Shyama', 'Gajanan', 'Chandan',
  'Nandan', 'Kiran', 'Arjun', 'Varun', 'Tarun', 'Arun', 'Madan', 'Chetan',
  'Ketan', 'Ratan', 'Chaman', 'Aman', 'Bhawan', 'Kalyan', 'Narayan', 'Laxman',
  'Hanuman', 'Bhagwan', 'Bhagwat', 'Dayaram', 'Sitaram', 'Hariram', 'Bajrang', 'Mangal',
  'Parag', 'Chirag', 'Anurag', 'Saurabh', 'Rishabh', 'Vaibhav', 'Madhav', 'Keshav',
  'Raghav', 'Sagar', 'Nagar', 'Shravan', 'Bhavan', 'Charan', 'Karan', 'Gagan',
  'Magan', 'Lagan', 'Ragan', 'Vihan', 'Rohan', 'Sohan', 'Gokul', 'Rahul',
  'Vipul', 'Bipul', 'Kapil', 'Sahil', 'Nikhil', 'Akhil', 'Sudhir', 'Raghubir',
  'Ranjit', 'Gurpreet', 'Simran', 'Kiran', 'Pooran', 'Gagan', 'Chaman', 'Shaman',
  'Raman', 'Gaman', 'Jaman', 'Kaman', 'Laman', 'Maman', 'Naman', 'Paman'
];

const lastNames = [
  'Kumar', 'Singh', 'Sharma', 'Gupta', 'Yadav', 'Prasad', 'Mishra', 'Pandey',
  'Tiwari', 'Dubey', 'Chaudhary', 'Joshi', 'Agarwal', 'Bansal', 'Mittal', 'Goel',
  'Saxena', 'Srivastava', 'Verma', 'Shukla', 'Tripathi', 'Ojha', 'Upadhyay', 'Dwivedi',
  'Pathak', 'Jha', 'Thakur', 'Chouhan', 'Rajput', 'Rathore', 'Shekhawat', 'Sisodia',
  'Gaur', 'Garg', 'Tyagi', 'Bhatia', 'Malhotra', 'Kapoor', 'Khanna', 'Sethi',
  'Mehra', 'Arora', 'Khurana', 'Grover', 'Chopra', 'Sood', 'Ahuja', 'Bajaj',
  'Tandon', 'Sachdeva', 'Wadhwa', 'Kandpal', 'Bisht', 'Negi', 'Rawat', 'Chauhan',
  'Patel', 'Shah', 'Modi', 'Mehta', 'Desai', 'Jain', 'Agrawal', 'Goyal',
  'Jindal', 'Singhal', 'Bansal', 'Khandelwal', 'Maheshwari', 'Somani', 'Kothari', 'Porwal',
  'Daga', 'Saraf', 'Kedia', 'Poddar', 'Goenka', 'Birla', 'Agarwal', 'Mittal',
  'Reddy', 'Rao', 'Naidu', 'Chandra', 'Murthy', 'Sastry', 'Iyer', 'Nair',
  'Menon', 'Pillai', 'Kurup', 'Varma', 'Bhat', 'Shenoy', 'Hegde', 'Kamath',
  'Das', 'Roy', 'Ghosh', 'Bose', 'Sen', 'Dutta', 'Mukherjee', 'Banerjee',
  'Chatterjee', 'Bhattacharya', 'Chakraborty', 'Sanyal', 'Mitra', 'Saha', 'Pal', 'Mondal'
];

const villages = [
  'Rampur', 'Shyampur', 'Govindpur', 'Krishnapur', 'Haripur', 'Shantipur', 'Sukhpur', 'Anandpur',
  'Fatehpur', 'Pratappur', 'Vijaypur', 'Jaypur', 'Rajpur', 'Sultanpur', 'Mahmudpur', 'Alipur',
  'Saharanpur', 'Muzaffarpur', 'Sitapur', 'Lalitpur', 'Chandpur', 'Madhupur', 'Kamlapur', 'Ganga Nagar',
  'Ram Nagar', 'Shiv Nagar', 'Vishnu Nagar', 'Lakshmi Nagar', 'Saraswati Nagar', 'Durga Nagar', 'Kali Nagar', 'Hanuman Nagar',
  'Gandhi Nagar', 'Nehru Nagar', 'Patel Nagar', 'Lal Bahadur Nagar', 'Rajiv Nagar', 'Indira Nagar', 'Subhash Nagar', 'Tilak Nagar',
  'Azad Nagar', 'Bhagat Singh Nagar', 'Vivekanand Nagar', 'Tagore Nagar', 'Kabir Nagar', 'Tulsidas Nagar', 'Surdas Nagar', 'Meera Nagar',
  'Radha Nagar', 'Krishna Nagar', 'Arjun Nagar', 'Bhishma Nagar', 'Dronacharya Nagar', 'Eklavya Nagar', 'Abhimanyu Nagar', 'Jayadrath Nagar',
  'Karnavar', 'Bhimgaon', 'Yudhishthir Nagar', 'Nakul Nagar', 'Sahadev Nagar', 'Dharmaraj Nagar', 'Pandav Nagar', 'Kaurav Nagar',
  'Hastinapur', 'Kurukshetra', 'Vrindavan', 'Mathura', 'Ayodhya', 'Kashi', 'Haridwar', 'Rishikesh',
  'Badrinath', 'Kedarnath', 'Gangotri', 'Yamunotri', 'Ujjain', 'Omkareshwar', 'Maheshwar', 'Chitrakoot',
  'Amarkantak', 'Narmadapuram', 'Pachmarhi', 'Khajuraho', 'Gwalior', 'Orchha', 'Sanchi', 'Bhimbetka',
  'Mandu', 'Dhar', 'Indore', 'Dewas', 'Ujjain', 'Ratlam', 'Mandsaur', 'Neemuch',
  'Balaghat', 'Seoni', 'Mandla', 'Dindori', 'Jabalpur', 'Katni', 'Umaria', 'Shahdol',
  'Anuppur', 'Sidhi', 'Singrauli', 'Rewa', 'Satna', 'Maihar', 'Nagod', 'Amarpatan',
  'Chitrakoot', 'Banda', 'Hamirpur', 'Mahoba', 'Jhansi', 'Lalitpur', 'Jalaun', 'Orai',
  'Kalpi', 'Auraiya', 'Etawah', 'Kanpur', 'Unnao', 'Rae Bareli', 'Pratapgarh', 'Kaushambi',
  'Allahabad', 'Fatehpur', 'Kannauj', 'Farrukhabad', 'Etah', 'Mainpuri', 'Firozabad', 'Agra',
  'Mathura', 'Aligarh', 'Hathras', 'Kasganj', 'Badaun', 'Bareilly', 'Pilibhit', 'Shahjahanpur',
  'Kheri', 'Sitapur', 'Hardoi', 'Lucknow', 'Barabanki', 'Faizabad', 'Ambedkar Nagar', 'Sultanpur',
  'Bahraich', 'Shravasti', 'Balrampur', 'Gonda', 'Siddharthnagar', 'Basti', 'Sant Kabir Nagar', 'Maharajganj',
  'Gorakhpur', 'Kushinagar', 'Deoria', 'Azamgarh', 'Mau', 'Ballia', 'Jaunpur', 'Ghazipur',
  'Chandauli', 'Varanasi', 'Mirzapur', 'Sonbhadra', 'Kaimur', 'Rohtas', 'Bhojpur', 'Buxar',
  'Patna', 'Nalanda', 'Sheikhpura', 'Lakhisarai', 'Jamui', 'Munger', 'Khagaria', 'Begusarai',
  'Saharsa', 'Madhepura', 'Supaul', 'Araria', 'Purnia', 'Katihar', 'Kishanganj', 'Darbhanga',
  'Muzaffarpur', 'Gopalganj', 'Siwan', 'Saran', 'Vaishali', 'Samastipur', 'Madhubani', 'Sitamarhi'
];

// Generate random Aadhaar (12 digits)
function generateAadhaar() {
  return Array.from({length: 12}, () => Math.floor(Math.random() * 10)).join('');
}

// Generate random contact (10 digits starting with 6-9)
function generateContact() {
  const firstDigit = Math.floor(Math.random() * 4) + 6; // 6, 7, 8, or 9
  const remainingDigits = Array.from({length: 9}, () => Math.floor(Math.random() * 10)).join('');
  return firstDigit + remainingDigits;
}

// Generate random date within last 14 days
function getRandomDateInLast14Days() {
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
  const randomTime = fourteenDaysAgo.getTime() + Math.random() * (now.getTime() - fourteenDaysAgo.getTime());
  return new Date(randomTime);
}

// Generate random date for farmer registration (within last month)
function getRandomFarmerRegistrationDate() {
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const randomTime = oneMonthAgo.getTime() + Math.random() * (now.getTime() - oneMonthAgo.getTime());
  return new Date(randomTime);
}

// Price per bag (realistic range)
const UREA_PRICES = [266, 267, 268, 269, 270, 271, 272];

console.log('🌾 UREA PACS Sample Data Generator');
console.log('===================================');
console.log('Generating 200 farmers with 10-20 orders each over the past 2 weeks...');
console.log('');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    return;
  }

  console.log('📊 Connected to SQLite database.');
  
  // Generate farmers
  const farmers = [];
  const usedAadhaar = new Set();
  
  for (let i = 0; i < 200; i++) {
    let aadhaar;
    do {
      aadhaar = generateAadhaar();
    } while (usedAadhaar.has(aadhaar));
    usedAadhaar.add(aadhaar);
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const village = villages[Math.floor(Math.random() * villages.length)];
    const contact = generateContact();
    const created_at = getRandomFarmerRegistrationDate().toISOString();
    
    farmers.push({
      aadhaar,
      name,
      village,
      contact,
      created_at
    });
  }
  
  console.log('✅ Generated 200 farmer records');
  
  // Insert farmers into database
  db.serialize(() => {
    const insertFarmer = db.prepare(`
      INSERT INTO farmers (aadhaar, name, village, contact, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    farmers.forEach((farmer, index) => {
      insertFarmer.run([
        farmer.aadhaar,
        farmer.name,
        farmer.village,
        farmer.contact,
        farmer.created_at
      ], function(err) {
        if (err) {
          console.error(`❌ Error inserting farmer ${index + 1}:`, err.message);
        }
      });
    });
    
    insertFarmer.finalize(() => {
      console.log('✅ Inserted all farmers into database');
      
      // Now generate orders for each farmer
      db.all('SELECT * FROM farmers ORDER BY id', (err, dbFarmers) => {
        if (err) {
          console.error('❌ Error fetching farmers:', err.message);
          return;
        }
        
        const orders = [];
        let billNumber = 1;
        
        dbFarmers.forEach((farmer) => {
          // Generate 10-20 orders per farmer
          const numOrders = Math.floor(Math.random() * 11) + 10; // 10-20 orders
          
          for (let i = 0; i < numOrders; i++) {
            const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 bags
            const unit_price = UREA_PRICES[Math.floor(Math.random() * UREA_PRICES.length)];
            const total_amount = quantity * unit_price;
            const created_at = getRandomDateInLast14Days().toISOString();
            
            orders.push({
              farmer_id: farmer.id,
              quantity,
              unit_price,
              total_amount,
              created_at
            });
          }
        });
        
        // Sort orders by date to ensure chronological order
        orders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        
        console.log(`✅ Generated ${orders.length} order records`);
        
        // Insert orders into database
        const insertOrder = db.prepare(`
          INSERT INTO orders (farmer_id, quantity, unit_price, total_amount, created_at)
          VALUES (?, ?, ?, ?, ?)
        `);
        
        let insertedCount = 0;
        orders.forEach((order) => {
          insertOrder.run([
            order.farmer_id,
            order.quantity,
            order.unit_price,
            order.total_amount,
            order.created_at
          ], function(err) {
            if (err) {
              console.error(`❌ Error inserting order:`, err.message);
            } else {
              insertedCount++;
              if (insertedCount % 500 === 0) {
                console.log(`📈 Inserted ${insertedCount}/${orders.length} orders...`);
              }
            }
          });
        });
        
        insertOrder.finalize(() => {
          console.log('✅ Inserted all orders into database');
          
          // Update farmer statistics
          console.log('📊 Updating farmer statistics...');
          
          db.run(`
            UPDATE farmers SET 
              total_orders = (
                SELECT COUNT(*) FROM orders WHERE orders.farmer_id = farmers.id
              ),
              total_spent = (
                SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE orders.farmer_id = farmers.id
              ),
              last_order_date = (
                SELECT MAX(created_at) FROM orders WHERE orders.farmer_id = farmers.id
              )
          `, (err) => {
            if (err) {
              console.error('❌ Error updating farmer statistics:', err.message);
            } else {
              console.log('✅ Updated farmer statistics');
            }
            
            // Final verification
            db.get('SELECT COUNT(*) as farmers_count FROM farmers', (err, farmersRow) => {
              db.get('SELECT COUNT(*) as orders_count FROM orders', (err, ordersRow) => {
                db.get('SELECT MIN(id) as min_id, MAX(id) as max_id FROM orders', (err, orderRow) => {
                  console.log('');
                  console.log('🎉 Sample data generation complete!');
                  console.log('=====================================');
                  console.log(`👥 Farmers: ${farmersRow?.farmers_count || 0}`);
                  console.log(`📦 Orders: ${ordersRow?.orders_count || 0}`);
                  console.log(`🧾 Order IDs: ${orderRow?.min_id || 0} - ${orderRow?.max_id || 0}`);
                  console.log('📅 Order dates: Last 14 days');
                  console.log('💰 Price range: ₹266-272 per bag');
                  console.log('📊 Orders per farmer: 10-20');
                  console.log('');
                  console.log('🚀 Ready to start the PACS application!');
                  
                  db.close((err) => {
                    if (err) {
                      console.error('❌ Error closing database:', err.message);
                    } else {
                      console.log('📊 Database connection closed.');
                    }
                  });
                });
              });
            });
          });
        });
      });
    });
  });
});