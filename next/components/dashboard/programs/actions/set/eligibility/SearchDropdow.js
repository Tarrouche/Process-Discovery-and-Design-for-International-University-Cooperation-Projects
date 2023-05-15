import React, { useState, useRef, useEffect } from "react";
import { Form, Dropdown } from "react-bootstrap";

const SearchDropdown = ({ dropdownItems, handleItemChange, placeholder }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setShowDropdown(true);
    };

    useEffect(() => {
        function handleClickOutsideDropdown(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("click", handleClickOutsideDropdown);
        return () => {
            document.removeEventListener("click", handleClickOutsideDropdown);
        };
    }, [dropdownRef]);

    return (
        <div ref={dropdownRef}>
            <Form.Group controlId="formBasicCountrySearch">
                <Form.Control
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClick={(event) => {
                        event.stopPropagation();
                        setShowDropdown(true);
                    }}
                />
            </Form.Group>
            <Form.Group controlId="formBasicItemDropdown">
                <Dropdown show={showDropdown} onHide={() => setShowDropdown(false)}>
                    <Dropdown.Menu onHide={() => setShowDropdown(false)}>
                        {dropdownItems.map((item, index) => (
                            <Dropdown.Item
                                key={`add-${index}`}
                                onClick={() => handleItemChange(item.applicationId || item)}
                            >
                                {item.name || item}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Form.Group>
        </div>
    );
};

export default SearchDropdown;
