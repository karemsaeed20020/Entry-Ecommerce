import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Supplier from './models/supplierModel.js';
import User from './models/userModel.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get an admin user for createdBy field
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found to associate with suppliers. Please create an admin first.');
      process.exit(1);
    }

    const suppliers = [
      {
        name: 'Global Tech Solutions',
        email: 'info@globaltech.com',
        contact: '+1 555-0101',
        address: '123 Silicon Valley Way, San Jose, CA',
        paymentSystem: 'bank-transfer',
        isActive: true,
        createdBy: { id: admin._id, name: admin.name }
      },
      {
        name: 'Nexus Electronics',
        email: 'sales@nexus-elec.com',
        contact: '+1 555-0202',
        address: '456 Innovation Drive, Austin, TX',
        paymentSystem: 'credit',
        isActive: true,
        createdBy: { id: admin._id, name: admin.name }
      },
      {
        name: 'Prime Logistics & Goods',
        email: 'contact@primelogistics.net',
        contact: '+1 555-0303',
        address: '789 Commerce Blvd, Chicago, IL',
        paymentSystem: 'cash',
        isActive: true,
        createdBy: { id: admin._id, name: admin.name }
      },
      {
        name: 'Eco-Friendly Supplies Co.',
        email: 'hello@eco-supplies.org',
        contact: '+1 555-0404',
        address: '101 Green Road, Portland, OR',
        paymentSystem: 'online',
        isActive: true,
        createdBy: { id: admin._id, name: admin.name }
      }
    ];

    // Clear existing suppliers if any (optional, uncomment to clean before seeding)
    // await Supplier.deleteMany({});

    for (const s of suppliers) {
      const existing = await Supplier.findOne({ email: s.email });
      if (!existing) {
        await Supplier.create(s);
        console.log(`Seeded supplier: ${s.name}`);
      } else {
        console.log(`Supplier already exists: ${s.name}`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
