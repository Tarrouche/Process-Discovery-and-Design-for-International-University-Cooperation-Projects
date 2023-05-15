import { useState, useRef, useEffect } from 'react';
import { Dropdown, Form } from 'react-bootstrap';

function ItemSearchDropdown({ items, setItem, x }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setShowDropdown(true);

    };

    const filteredItems = items.filter((item) =>
        item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleItemChange = (institution) => {
        setItem({ ...x, name: institution });
        setShowDropdown(false);
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
            <Form.Group controlId="formBasicItemSearch">
                <Form.Label>You should establish communication with the institution of your choice</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Search for an institution..."
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
                        {filteredItems.map((item, index) => (
                            <Dropdown.Item key={`item-${index}`} onClick={() => handleItemChange(item)}>
                                {item}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </Form.Group>
        </div>
    );
}

export default ItemSearchDropdown;
