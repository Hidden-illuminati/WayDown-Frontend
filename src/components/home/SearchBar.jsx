import { useState, useCallback, useEffect } from "react";
import {
  InputGroup,
  Form,
  Button,
  Spinner,
  ListGroup,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import PropTypes from "prop-types";
import debounce from "lodash/debounce";

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Debounced search handler for suggestions
  const handleSearchSuggestions = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(
          "https://waydown-backend-0w9y.onrender.com/api/spots/search/suggestions",
          {
            params: { q: searchQuery },
            timeout: 5000,
          }
        );
        const data = response.data;
        // Ensure suggestions is an array
        setSuggestions(Array.isArray(data) ? data : data?.suggestions || []);
      } catch (err) {
        console.error(
          "Error fetching suggestions:",
          err.response?.data || err.message
        );
        setError("Failed to fetch suggestions. Please try again.");
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle input change
  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;
      setQuery(value);
      handleSearchSuggestions(value);
    },
    [handleSearchSuggestions]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!query.trim()) return;

      setLoading(true);
      setError(null);
      setSuggestions([]); // Clear suggestions on full search

      try {
        const response = await axios.get(
          "https://waydown-backend-0w9y.onrender.com/api/spots/search",
          {
            params: { query },
            timeout: 5000,
          }
        );
        const searchResults = response.data;
        // Pass results to parent (ensure it’s an array or structured data)
        onSearch(
          Array.isArray(searchResults)
            ? searchResults
            : searchResults.spots || []
        );
      } catch (err) {
        console.error(
          "Error during search:",
          err.response?.data || err.message
        );
        setError("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [query, onSearch]
  );

  // Handle suggestion click
  const handleSuggestionClick = useCallback(
    (suggestion) => {
      setQuery(suggestion);
      setSuggestions([]);
      // Trigger search immediately with the selected suggestion
      handleSubmit({ preventDefault: () => {} });
    },
    [handleSubmit]
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => handleSearchSuggestions.cancel();
  }, [handleSearchSuggestions]);

  return (
    <Form onSubmit={handleSubmit} className="position-relative">
      <InputGroup className="mb-3">
        <InputGroup.Text>
          {loading ? (
            <Spinner animation="border" size="sm" aria-label="Loading" />
          ) : (
            <i className="bi bi-search" aria-hidden="true"></i>
          )}
        </InputGroup.Text>
        <Form.Control
          placeholder="Search for hidden spots, locations, or categories..."
          value={query}
          onChange={handleChange}
          disabled={loading}
          aria-label="Search for spots"
        />
        <Button
          variant="primary"
          type="submit"
          disabled={loading || !query.trim()}
        >
          Search
        </Button>
      </InputGroup>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <ListGroup
          className="position-absolute w-100"
          style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
        >
          {suggestions.map((suggestion, index) => (
            <ListGroup.Item
              key={index}
              action
              onClick={() => handleSuggestionClick(suggestion)}
              style={{ cursor: "pointer" }}
            >
              {suggestion}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      {/* Error message */}
      {error && (
        <Alert
          variant="danger"
          className="small mt-1"
          dismissible
          onClose={() => setError(null)}
        >
          {error}
          <Button variant="link" onClick={handleSubmit} className="p-0 ms-2">
            Retry
          </Button>
        </Alert>
      )}
    </Form>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
};

export default SearchBar;
