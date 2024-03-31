import React, { useState, useEffect } from 'react';
import UserTeamModal from './UserTeamModal';

const UsersList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);


  const pageSize = 12; // Adjust as needed

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase()); // Lowercase for search
  };

  const handleDomainChange = (event) => {
    setSelectedDomain(event.target.value);
  };

  const handleGenderChange = (event) => {
    setSelectedGender(event.target.value);
  };

  const handleAvailabilityChange = (event) => {
    setSelectedAvailability(event.target.value);
  };

  const handleUserCheckboxChange = (event, user) => {
    const newSelectedUsers = [...selectedUsers];
    const userIndex = newSelectedUsers.findIndex(u => u.id === user.id);
  
    if (userIndex >= 0) {   
        newSelectedUsers.splice(userIndex, 1);
        alert("Removed From Team");
    } else {
      // User newly selected, add to selection with validation
      const hasSameDomain = newSelectedUsers.some(u => u.domain === user.domain);
      if(!user.available){
        alert("Please Select users who are available!")
        return
      }
      else if (!hasSameDomain) {
        newSelectedUsers.push(user);
      } else {
        alert('Please select a user from a different domain.');
        return
      }
        alert("Added To Team")
    }
  
    setSelectedUsers(newSelectedUsers);
  };
  

  useEffect(() => {
  const fetchData = async () => {
    const search = searchTerm.toLowerCase();
    const domain = selectedDomain ? `&domain=${selectedDomain}` : '';
    const gender = selectedGender ? `&gender=${selectedGender}` : '';
    const availability = selectedAvailability ? `&availability=${selectedAvailability}` : '';

    const response = await fetch(`http://localhost:3000/users?q=${search}${domain}${gender}${availability}&page=${currentPage}&limit=${pageSize}`);
    const data = await response.json();
    setUsers(data.data);
    setTotalPages(data.totalPages);
  };

  fetchData();
}, [searchTerm, currentPage, selectedDomain, selectedGender, selectedAvailability]);


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="user-list-container">
        {isModalOpen && (
            <UserTeamModal
                selectedUsers={selectedUsers}
                onRemoveUser={handleUserCheckboxChange}
                onClose={() => setIsModalOpen(false)} // Close modal on onClose handler
            />
        )}
        <div className="top-section">
            <p className='view-team'
                onClick={() => setIsModalOpen(!isModalOpen)}
                >
                View Your Team ({selectedUsers.length})
            </p>
            <h1 className="users-title">Users</h1>
            <div className="search-container">
                <label htmlFor="searchInput" className="search-label">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 30 30">
<path d="M 13 3 C 7.4889971 3 3 7.4889971 3 13 C 3 18.511003 7.4889971 23 13 23 C 15.396508 23 17.597385 22.148986 19.322266 20.736328 L 25.292969 26.707031 A 1.0001 1.0001 0 1 0 26.707031 25.292969 L 20.736328 19.322266 C 22.148986 17.597385 23 15.396508 23 13 C 23 7.4889971 18.511003 3 13 3 z M 13 5 C 17.430123 5 21 8.5698774 21 13 C 21 17.430123 17.430123 21 13 21 C 8.5698774 21 5 17.430123 5 13 C 5 8.5698774 8.5698774 5 13 5 z"></path>
                    </svg>
                </label>
                <input
                id="searchInput"
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Search by Name"
                className="search-input"
                />
            </div>
            <h3>Filters</h3>
            <ul className="filter-list">
                <li>
                <select value={selectedDomain} onChange={handleDomainChange} className="filter-select">
                    <option value="">All Domains</option>
                    <option value="sales">Sales</option>
                    <option value="finance">Finance</option>
                    <option value="Marketing">Marketing</option>
                    <option value="IT">IT</option>
                    <option value="Management">Management</option>
                    <option value="UI Designing">UI Designing</option>
                    <option value="Business Development">Business Development</option>
                </select>
                </li>
                <li>
                <select value={selectedGender} onChange={handleGenderChange} className="filter-select">
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                </li>
                <li>
                <select value={selectedAvailability} onChange={handleAvailabilityChange} className="filter-select">
                    <option value="">All Availability</option>
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                </select>
                </li>
            </ul>
        </div>

      <div className="user-cards">
        {users.map((user) => (
          <div key={user.id} className="user-card">
            <div className='card-top'>
                <img src={user.avatar} alt={user.first_name + ' ' + user.last_name} className='user-avatar' />
                <div>
                    <h3>{user.first_name} {user.last_name}</h3>
                    <p>{user.email}</p>
                </div>
            </div>
            <div className="user-info">
                <div>
                    <p><span className='bold'>Domain</span> {user.domain}</p>
                    <p><span className='bold'>Gender</span> {user.gender}</p>
                </div>
              {user.available ? (
                <span className="availability-label available">Available</span>
              ) : (
                <span className="availability-label unavailable">Unavailable</span>
              )}
            </div>
            <button className='add-to-team' onClick={() => handleUserCheckboxChange(this, user)}>
                {selectedUsers.some(selectedUser => selectedUser.id === user.id)
                    ? 'Remove from Team'
                    : 'Add to Team'}
            </button>

          </div>
        ))}
      </div>

      {/* Pagination controls */}
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};

export default UsersList;
