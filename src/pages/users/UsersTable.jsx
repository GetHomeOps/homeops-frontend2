import React, {useMemo} from "react";
import {useTranslation} from "react-i18next";
import {useNavigate, useParams} from "react-router-dom";
import DataTable from "../../components/DataTable";
import DataTableItem from "../../components/DataTableItem";

function UsersTable({
  users,
  onToggleSelect,
  selectedItems,
  totalUsers,
  currentPage,
  itemsPerPage,
  sortConfig,
  onSort,
  onUserClick,
}) {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {dbUrl} = useParams();

  // Get current page items
  const currentUsers = useMemo(() => {
    if (!users) return [];
    const indexOfLastContact = currentPage * itemsPerPage;
    const indexOfFirstContact = indexOfLastContact - itemsPerPage;
    return users.slice(indexOfFirstContact, indexOfLastContact);
  }, [currentPage, itemsPerPage, users]);

  // Check if all current page items are selected
  const allSelected = useMemo(() => {
    return (
      currentUsers.length > 0 &&
      currentUsers.every((contact) => selectedItems.includes(contact.id))
    );
  }, [currentUsers, selectedItems]);

  // Define columns configuration
  const columns = [
    {
      key: "name",
      label: t("name"),
      sortable: true,
    },
    {
      key: "email",
      label: t("email"),
      sortable: true,
    },
    {
      key: "role",
      label: t("role"),
      sortable: true,
    },
  ];

  // Custom item renderer
  const renderItem = (item, handleSelect, selectedItems, onItemClick) => (
    <DataTableItem
      item={item}
      columns={columns}
      onSelect={handleSelect}
      isSelected={selectedItems.includes(item.id)}
      onItemClick={onItemClick}
    />
  );

  return (
    <DataTable
      items={currentUsers}
      columns={columns}
      onItemClick={onUserClick}
      onSelect={onToggleSelect}
      selectedItems={selectedItems}
      totalItems={totalUsers}
      title="allUsers"
      sortConfig={sortConfig}
      onSort={onSort}
      emptyMessage="noUsersFound"
      renderItem={renderItem}
      allSelected={allSelected}
    />
  );
}

export default UsersTable;
