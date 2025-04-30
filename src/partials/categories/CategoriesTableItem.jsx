import React from "react";
import {useNavigate} from "react-router-dom";
import {icons} from "../../assets/icons";

function CategoriesTableItem({
  id,
  name,
  icon,
  url,
  category,
  description,
  handleSelect,
  // handleClick,
  isChecked,
  isAlternate,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/admin/categories/${id}`);
  };

  return (
    <tr
      className={`${
        isAlternate
          ? "bg-gray-50 dark:bg-gray-700/20"
          : "bg-white dark:bg-gray-700/10"
      } hover:bg-gray-200/60 dark:hover:bg-gray-700/90`}
    >
      <td className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap w-px">
        <div className="flex items-center">
          <label className="inline-flex">
            <span className="sr-only">Select</span>
            <input
              id={id}
              className="form-checkbox"
              type="checkbox"
              onChange={handleSelect}
              checked={isChecked}
            />
          </label>
        </div>
      </td>

      <td
        className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
        onClick={handleClick}
      >
        <div className="font-medium text-gray-800 dark:text-gray-100">
          {name}
        </div>
      </td>
    </tr>
  );
}

export default CategoriesTableItem;
