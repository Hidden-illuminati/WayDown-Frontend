import { useState, useEffect, useCallback } from "react";
import { Card, Badge, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../../firebase";

const TrendingTags = ({ limit = 10 }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useAuthState(auth);

  const fetchTrendingTags = useCallback(async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await axios.get(
        "https://waydown-backend-0w9y.onrender.com/api/community/tags/trending",
        {
          params: { limit },
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000,
        }
      );
      setTags(response.data || []);
      setLoading(false);
    } catch (err) {
      setError(
        "Failed to load trending tags: " +
          (err.response?.data?.message || err.message)
      );
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTrendingTags();
  }, [fetchTrendingTags]);

  if (loading) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading trending tags...
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center text-danger">
          {error}
          <div>
            <button
              className="btn btn-link p-0 mt-2"
              onClick={fetchTrendingTags}
            >
              Retry
            </button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">Trending Tags</Card.Title>
        <div className="d-flex flex-wrap gap-2">
          {tags.length > 0 ? (
            tags.map((tag) => (
              <Link
                to={`/tags/${tag.name}`}
                key={tag.name}
                className="text-decoration-none"
              >
                <Badge bg="light" text="dark" className="p-2 mb-2">
                  #{tag.name} <span className="text-muted">({tag.count})</span>
                </Badge>
              </Link>
            ))
          ) : (
            <p className="text-muted m-0">No trending tags available.</p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

TrendingTags.propTypes = {
  limit: PropTypes.number,
};

export default TrendingTags; // ✅ Ensure this is a default export
