import React from "react";
import {Home, MapPin, Ruler, Zap, FileText} from "lucide-react";

function IdentityTab({propertyData, handleInputChange}) {
  return (
    <div className="space-y-4">
      {/* Identity Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Home className="h-5 w-5 text-[#456654]" />
          Identity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Passport ID
            </label>
            <input
              type="text"
              name="passportId"
              value={propertyData.passportId || propertyData.id}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Full Address
            </label>
            <input
              type="text"
              name="fullAddress"
              value={
                propertyData.fullAddress ||
                `${propertyData.address}, ${propertyData.city}, ${propertyData.state} ${propertyData.zip}`
              }
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Parcel & Tax ID
            </label>
            <input
              type="text"
              name="parcelTaxId"
              value={propertyData.parcelTaxId || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Year Built
            </label>
            <input
              type="number"
              name="yearBuilt"
              value={propertyData.yearBuilt || 1995}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Property Type
            </label>
            <select
              name="propertyType"
              value={propertyData.propertyType || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select property type</option>
              <option value="Single Family">Single Family</option>
              <option value="Townhouse">Townhouse</option>
              <option value="Condo">Condo</option>
              <option value="Multi-Family">Multi-Family</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Subdivision/Plat
            </label>
            <input
              type="text"
              name="subdivisionPlat"
              value={propertyData.subdivisionPlat || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Jurisdiction Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#456654]" />
          Jurisdiction
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              City & County
            </label>
            <input
              type="text"
              name="cityCounty"
              value={propertyData.cityCounty || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Zoning Code
            </label>
            <input
              type="text"
              name="zoningCode"
              value={propertyData.zoningCode || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              School District
            </label>
            <input
              type="text"
              name="schoolDistrict"
              value={propertyData.schoolDistrict || ""}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="Name only"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              HOA
            </label>
            <select
              name="hoa"
              value={propertyData.hoa || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Specs Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Ruler className="h-5 w-5 text-[#456654]" />
          Specs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Living Area (Sq Ft)
            </label>
            <input
              type="number"
              name="livingArea"
              value={propertyData.livingArea || propertyData.squareFeet}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Lot Size (Sq Ft)
            </label>
            <input
              type="number"
              name="lotSize"
              value={propertyData.lotSize || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Stories
            </label>
            <input
              type="number"
              name="stories"
              value={propertyData.stories || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Bed/Bath Count
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="bedCount"
                value={propertyData.bedCount || propertyData.rooms}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Beds"
              />
              <input
                type="number"
                name="bathCount"
                value={propertyData.bathCount || propertyData.bathrooms}
                onChange={handleInputChange}
                className="form-input w-full"
                placeholder="Baths"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Utilities Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <Zap className="h-5 w-5 text-[#456654]" />
          Utilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Water
            </label>
            <input
              type="text"
              name="waterUtility"
              value={propertyData.waterUtility || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Sewer
            </label>
            <input
              type="text"
              name="sewerUtility"
              value={propertyData.sewerUtility || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Gas
            </label>
            <input
              type="text"
              name="gasUtility"
              value={propertyData.gasUtility || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Electric
            </label>
            <input
              type="text"
              name="electricUtility"
              value={propertyData.electricUtility || ""}
              onChange={handleInputChange}
              className="form-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Septic?
            </label>
            <select
              name="septic"
              value={propertyData.septic || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Well?
            </label>
            <select
              name="well"
              value={propertyData.well || ""}
              onChange={handleInputChange}
              className="form-select w-full"
            >
              <option value="">Select</option>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tax & Assessment Section */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
          <FileText className="h-5 w-5 text-[#456654]" />
          Tax & Assessment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tax Year 1
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="taxYear1"
                value={propertyData.taxYear1 || ""}
                onChange={handleInputChange}
                className="form-input w-1/2"
                placeholder="Year"
              />
              <input
                type="number"
                name="taxAmount1"
                value={propertyData.taxAmount1 || ""}
                onChange={handleInputChange}
                className="form-input w-1/2"
                placeholder="Amount"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tax Year 2
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="taxYear2"
                value={propertyData.taxYear2 || ""}
                onChange={handleInputChange}
                className="form-input w-1/2"
                placeholder="Year"
              />
              <input
                type="number"
                name="taxAmount2"
                value={propertyData.taxAmount2 || ""}
                onChange={handleInputChange}
                className="form-input w-1/2"
                placeholder="Amount"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tax Year 3
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                name="taxYear3"
                value={propertyData.taxYear3 || ""}
                onChange={handleInputChange}
                className="form-input w-1/2"
                placeholder="Year"
              />
              <input
                type="number"
                name="taxAmount3"
                value={propertyData.taxAmount3 || ""}
                onChange={handleInputChange}
                className="form-input w-1/2"
                placeholder="Amount"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Assessed Value
            </label>
            <input
              type="number"
              name="assessedValue"
              value={propertyData.assessedValue || ""}
              onChange={handleInputChange}
              className="form-input w-full"
              placeholder="For context, not valuation"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdentityTab;
