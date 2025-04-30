import React from "react";
import {useNavigate} from "react-router-dom";
import {icons} from "../../assets/icons";

function AppsTableItem({
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

  const handleClickInternal = () => {
    navigate(`/admin/apps/${id}`);
  };

  console.log("category: ", category);
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
        onClick={handleClickInternal}
      >
        <div className="font-medium text-gray-800 dark:text-gray-100">
          {name}
        </div>
      </td>
      <td
        className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
        onClick={handleClickInternal}
      >
        <div className="flex items-center">
          <div className="w-6 h-auto shrink-0 mr-2 sm:mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
            >
              <path d={icons[icon].svgPath} />
            </svg>
          </div>
        </div>
      </td>
      <td
        className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
        onClick={handleClickInternal}
      >
        <div className="text-left">{url}</div>
      </td>
      <td
        className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
        onClick={handleClickInternal}
      >
        <div className="text-left">{category}</div>
      </td>
      <td
        className="px-2 first:pl-5 last:pr-5 py-3 whitespace-nowrap cursor-pointer"
        onClick={handleClickInternal}
      >
        <div className="text-left">{description}</div>
      </td>
    </tr>
  );
}

export default AppsTableItem;
