import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "Flat",
        "PG",
        "Room",
        "Hostel",
        "Hotel",
        "Godam",
        "Lodge",
        "Office",
      ],
      required: true,
      index: true,
    },
    rent: {
      type: Number,
      required: true,
    },
    deposit: {
      type: Number,
      required: true,
    },
    maintenance_charges: {
      type: Number,
      default: 0,
    },
    electricity_bill_per_unit: {
      type: Number,
      default: 0,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    // Regular photos - Min 3 required
    photos: {
      type: [String],
      required: true,
    },
    // Optional video
    video: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: [
        "pending",
        "live",
        "booked",
        "rejected",
        "removed",
        "edit_requested",
      ],
      default: "pending",
    },
    rejection_reason: {
      type: String,
      default: null,
    },
    admin_note: {
      type: String,
      default: null,
    },
    owner_whatsapp: {
      type: String,
      required: true,
    },
    availability_date: {
      type: Date,
      required: true,
    },
    opening_time: String,
    closing_time: String,
    bhk_type: {
      type: String,
      enum: ["1 BHK", "2 BHK", "3 BHK", "Studio", "Independent House"],
    },
    area_sqft: Number,
    furnishing: {
      type: String,
      enum: ["Fully Furnished", "Semi Furnished", "Unfurnished"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    furniture_available: {
      type: [String],
      default: [],
    },
    preferred_tenants: {
      type: String,
      enum: ["Everyone", "Boys Only", "Girls Only", "Families", "Bachelors"],
    },
    restrictions: {
      type: [String],
      default: [],
    },
    parking: {
      type: String,
      enum: ["None", "Two-Wheeler", "Four-Wheeler", "Both"],
    },
    // Landmarks
    landmarks: {
      type: [
        {
          name: String,
          type: String,
          distance: String,
          maps_link: String,
        },
      ],
      default: [],
    },
    contact_unlocks: {
      type: Number,
      default: 0,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    approved_at: Date,
    approved_by: mongoose.Schema.Types.ObjectId,
  },
  {},
);

PropertySchema.index({ status: 1, city: 1, type: 1 });
PropertySchema.index({ owner_id: 1 });
PropertySchema.index({ created_at: -1 });
// 2dsphere index for geospatial queries (nearby search)
PropertySchema.index({ location: "2dsphere" });

export default mongoose.models.Property ||
  mongoose.model("Property", PropertySchema);
