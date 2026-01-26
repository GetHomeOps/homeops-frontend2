import React from "react";
import {
  Home,
  MapPin,
  User,
  Phone,
  Building2,
  Hash,
  Calendar,
  Ruler,
  Bed,
  Bath,
  Flame,
  Car,
  School,
  ExternalLink,
} from "lucide-react";

function IdentityTab({propertyData, handleInputChange}) {
  const Field = ({
    label,
    name,
    value,
    placeholder,
    type = "text",
    inputClassName = "form-input w-full",
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={handleInputChange}
        placeholder={placeholder}
        className={inputClassName}
      />
    </div>
  );

  const SelectField = ({label, name, value, options}) => (
    <div>
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <select
        name={name}
        value={value ?? ""}
        onChange={handleInputChange}
        className="form-select w-full"
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Identity + Address */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Home className="h-5 w-5 text-[#456654]" />
          Identity & Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field
            label="Passport ID"
            name="passportId"
            value={propertyData.passportId || propertyData.id}
          />
          <Field
            label="Tax / Parcel ID"
            name="taxId"
            value={propertyData.taxId || propertyData.parcelTaxId}
            placeholder="e.g. 9278300025"
          />
          <Field
            label="County"
            name="county"
            value={propertyData.county}
            placeholder="e.g. King"
          />

          <div className="md:col-span-3">
            <Field
              label="Full Address"
              name="fullAddress"
              value={
                propertyData.fullAddress ||
                `${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zip}`
              }
              placeholder="Street, City, State ZIP"
            />
          </div>

          <Field label="City" name="city" value={propertyData.city} />
          <Field label="State" name="state" value={propertyData.state} />
          <Field label="ZIP" name="zip" value={propertyData.zip} />
        </div>
      </div>

      {/* Ownership & Occupancy */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <User className="h-5 w-5 text-[#456654]" />
          Ownership & Occupancy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field
            label="Owner Name"
            name="ownerName"
            value={propertyData.ownerName}
          />
          <Field
            label="Owner Name 2"
            name="ownerName2"
            value={propertyData.ownerName2}
          />
          <Field
            label="Owner City"
            name="ownerCity"
            value={propertyData.ownerCity}
            placeholder="e.g. Seattle WA"
          />

          <Field
            label="Occupant Name"
            name="occupantName"
            value={propertyData.occupantName}
          />
          <SelectField
            label="Occupant Type"
            name="occupantType"
            value={propertyData.occupantType}
            options={["Owner", "Tenant", "Vacant", "Unknown"]}
          />
          <div className="hidden md:block" />

          <Field
            label="Owner Phone"
            name="ownerPhone"
            value={propertyData.ownerPhone}
            placeholder="(000) 000-0000"
          />
          <Field
            label="Phone to Show"
            name="phoneToShow"
            value={propertyData.phoneToShow}
            placeholder="(000) 000-0000"
          />
        </div>
      </div>

      {/* General Property Info */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-[#456654]" />
          General Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SelectField
            label="Property Type"
            name="propertyType"
            value={propertyData.propertyType}
            options={[
              "Single Family",
              "Townhouse",
              "Condo",
              "Multi-Family",
              "Manufactured",
              "Land",
              "Other",
            ]}
          />
          <Field
            label="Sub Type"
            name="subType"
            value={propertyData.subType}
            placeholder="e.g. Residential"
          />
          <Field
            label="Roof"
            name="roofType"
            value={propertyData.roofType}
            placeholder="e.g. Composition"
          />

          <Field
            label="Year Built"
            name="yearBuilt"
            type="number"
            value={propertyData.yearBuilt}
          />
          <Field
            label="Effective Yr Built"
            name="effectiveYearBuilt"
            type="number"
            value={propertyData.effectiveYearBuilt}
          />
          <Field
            label="Effective Yr Built Source"
            name="effectiveYearBuiltSource"
            value={propertyData.effectiveYearBuiltSource}
            placeholder="e.g. Public Records"
          />
        </div>
      </div>

      {/* Size & Lot */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Ruler className="h-5 w-5 text-[#456654]" />
          Size & Lot
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field
            label="SqFt (Total)"
            name="sqFtTotal"
            type="number"
            value={propertyData.sqFtTotal || propertyData.squareFeet}
          />
          <Field
            label="SqFt Finished"
            name="sqFtFinished"
            type="number"
            value={propertyData.sqFtFinished}
          />
          <Field
            label="SqFt Unfinished"
            name="sqFtUnfinished"
            type="number"
            value={propertyData.sqFtUnfinished}
          />

          <Field
            label="Garage SqFt"
            name="garageSqFt"
            type="number"
            value={propertyData.garageSqFt}
          />
          <Field
            label="Total Dwelling SqFt"
            name="totalDwellingSqFt"
            type="number"
            value={propertyData.totalDwellingSqFt}
          />
          <Field
            label="SqFt Source"
            name="sqFtSource"
            value={propertyData.sqFtSource}
            placeholder="e.g. KCR"
          />

          <Field
            label="Lot Size"
            name="lotSize"
            value={propertyData.lotSize}
            placeholder="e.g. .200 ac / 8,700 sf"
          />
          <Field
            label="Lot Size Source"
            name="lotSizeSource"
            value={propertyData.lotSizeSource}
            placeholder="e.g. KCR"
          />
          <Field
            label="Lot Dim"
            name="lotDim"
            value={propertyData.lotDim}
            placeholder="Optional"
          />

          <Field
            label="Price / SqFt"
            name="pricePerSqFt"
            value={propertyData.pricePerSqFt}
            placeholder="e.g. $602.41"
          />
          <Field
            label="Total Price / SqFt"
            name="totalPricePerSqFt"
            value={propertyData.totalPricePerSqFt}
            placeholder="e.g. $602.41"
          />
        </div>
      </div>

      {/* Rooms & Baths */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Bed className="h-5 w-5 text-[#456654]" />
          Rooms & Baths
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field
            label="Bedrooms"
            name="bedCount"
            type="number"
            value={propertyData.bedCount || propertyData.rooms}
          />
          <Field
            label="Bathrooms"
            name="bathCount"
            type="number"
            value={propertyData.bathCount || propertyData.bathrooms}
          />
          <div className="hidden md:block" />

          <Field
            label="Full Baths"
            name="fullBaths"
            type="number"
            value={propertyData.fullBaths}
          />
          <Field
            label="3/4 Baths"
            name="threeQuarterBaths"
            type="number"
            value={propertyData.threeQuarterBaths}
          />
          <Field
            label="Half Baths"
            name="halfBaths"
            type="number"
            value={propertyData.halfBaths}
          />

          <Field
            label="Number of Showers"
            name="numberOfShowers"
            type="number"
            value={propertyData.numberOfShowers}
          />
          <Field
            label="Number of Bathtubs"
            name="numberOfBathtubs"
            type="number"
            value={propertyData.numberOfBathtubs}
          />
        </div>
      </div>

      {/* Features & Parking */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Flame className="h-5 w-5 text-[#456654]" />
          Features & Parking
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field
            label="Fireplaces"
            name="fireplaces"
            type="number"
            value={propertyData.fireplaces}
          />
          <Field
            label="Fireplace Type(s)"
            name="fireplaceTypes"
            value={propertyData.fireplaceTypes}
            placeholder="e.g. Gas"
          />
          <Field
            label="Basement"
            name="basement"
            value={propertyData.basement}
            placeholder="e.g. Daylight, Fully Finished"
          />

          <Field
            label="Parking Type"
            name="parkingType"
            value={propertyData.parkingType}
            placeholder="e.g. Driveway Parking"
          />
          <Field
            label="Total Covered Parking"
            name="totalCoveredParking"
            type="number"
            value={propertyData.totalCoveredParking}
          />
          <Field
            label="Total Uncovered Parking"
            name="totalUncoveredParking"
            type="number"
            value={propertyData.totalUncoveredParking}
          />
        </div>
      </div>

      {/* Schools */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <School className="h-5 w-5 text-[#456654]" />
          Schools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field
            label="School District"
            name="schoolDistrict"
            value={propertyData.schoolDistrict}
            placeholder="e.g. Seattle"
          />
          <Field
            label="Elementary"
            name="elementarySchool"
            value={propertyData.elementarySchool}
          />
          <Field
            label="Junior High"
            name="juniorHighSchool"
            value={propertyData.juniorHighSchool}
          />
          <Field
            label="Senior High"
            name="seniorHighSchool"
            value={propertyData.seniorHighSchool}
          />
          <Field
            label="School District Websites"
            name="schoolDistrictWebsites"
            value={propertyData.schoolDistrictWebsites}
            placeholder="URL(s)"
          />
        </div>
      </div>

      {/* Listing & Dates */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-[#456654]" />
          Listing & Dates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Field
            label="List Date"
            name="listDate"
            value={propertyData.listDate}
            placeholder="MM/DD/YYYY"
          />
          <Field
            label="Expire Date"
            name="expireDate"
            value={propertyData.expireDate}
            placeholder="MM/DD/YYYY"
          />
        </div>
      </div>
    </div>
  );
}

export default IdentityTab;
