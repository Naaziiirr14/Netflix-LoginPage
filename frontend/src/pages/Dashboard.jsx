import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("netflix_user") || "{}");

  const [trending, setTrending] = useState([]);
  const [drama, setDrama] = useState([]);
  const [action, setAction] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedShow, setSelectedShow] = useState(null);
  const [heroShow, setHeroShow] = useState(null);

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    try {
      const [trendRes, dramaRes, actionRes] = await Promise.all([
        fetch("https://api.tvmaze.com/shows?page=0"),
        fetch("https://api.tvmaze.com/search/shows?q=drama"),
        fetch("https://api.tvmaze.com/search/shows?q=action"),
      ]);
      const trendData = await trendRes.json();
      const dramaData = await dramaRes.json();
      const actionData = await actionRes.json();

      const filtered = trendData.filter((s) => s.image);
      setTrending(filtered.slice(0, 18));
      setHeroShow(filtered[0]);
      setDrama(dramaData.filter((s) => s.show.image).map((s) => s.show).slice(0, 18));
      setAction(actionData.filter((s) => s.show.image).map((s) => s.show).slice(0, 18));
    } catch (err) {
      console.error("Error fetching shows:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(`https://api.tvmaze.com/search/shows?q=${val}`);
      const data = await res.json();
      setSearchResults(data.filter((s) => s.show.image).map((s) => s.show));
    } catch {
      setSearchResults([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("netflix_token");
    localStorage.removeItem("netflix_user");
    navigate("/login");
  };

  const stripHtml = (html) => {
    if (!html) return "No description available.";
    return html.replace(/<[^>]*>/g, "").slice(0, 200) + "...";
  };

  const ShowCard = ({ show }) => (
    <div className="show-card" onClick={() => setSelectedShow(show)}>
      <div className="show-card-img-wrap">
        <img src={show.image?.medium || show.image?.original} alt={show.name} loading="lazy" />
        <div className="show-card-overlay">
          <span className="play-btn">▶</span>
          <div className="show-card-info">
            <p className="show-card-name">{show.name}</p>
            {show.rating?.average && (
              <p className="show-card-rating">⭐ {show.rating.average}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const Row = ({ title, shows }) => (
    <div className="row-section">
      <h2 className="row-title">{title}</h2>
      <div className="row-scroll">
        {shows.map((show) => (
          <ShowCard key={show.id} show={show} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <div className="netflix-logo">NETFLIX</div>
          <ul className="nav-links">
            <li>Home</li>
            <li>TV Shows</li>
            <li>Movies</li>
            <li>New &amp; Popular</li>
          </ul>
        </div>
        <div className="navbar-right">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search shows..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <span className="user-avatar">{user.email?.[0]?.toUpperCase() || "U"}</span>
          <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
        </div>
      </nav>

      {loading ? (
        <div className="loader">
          <div className="loader-spinner" />
          <p>Loading shows...</p>
        </div>
      ) : (
        <>
          {searching && searchQuery.length >= 2 ? (
            <div className="search-results-page">
              <h2 className="row-title">Results for "{searchQuery}"</h2>
              <div className="search-grid">
                {searchResults.length > 0 ? (
                  searchResults.map((show) => <ShowCard key={show.id} show={show} />)
                ) : (
                  <p className="no-results">No results found.</p>
                )}
              </div>
            </div>
          ) : (
            <>
              {heroShow && (
                <div
                  className="hero"
                  style={{ backgroundImage: `url(${heroShow.image?.original || heroShow.image?.medium})` }}
                >
                  <div className="hero-overlay" />
                  <div className="hero-content">
                    <h1 className="hero-title">{heroShow.name}</h1>
                    <p className="hero-desc">{stripHtml(heroShow.summary)}</p>
                    <div className="hero-meta">
                      {heroShow.rating?.average && (
                        <span className="hero-rating">⭐ {heroShow.rating.average}</span>
                      )}
                      {heroShow.genres?.slice(0, 3).map((g) => (
                        <span key={g} className="hero-genre">{g}</span>
                      ))}
                    </div>
                    <div className="hero-buttons">
                      <button className="btn-play" onClick={() => setSelectedShow(heroShow)}>▶ Play</button>
                      <button className="btn-info" onClick={() => setSelectedShow(heroShow)}>ℹ More Info</button>
                    </div>
                  </div>
                </div>
              )}

              <div className="rows-container">
                <Row title="🔥 Trending Now" shows={trending} />
                <Row title="🎭 Drama" shows={drama} />
                <Row title="💥 Action & Adventure" shows={action} />
              </div>
            </>
          )}
        </>
      )}

      {selectedShow && (
        <div className="modal-overlay" onClick={() => setSelectedShow(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedShow(null)}>✕</button>
            <div className="modal-banner">
              <img src={selectedShow.image?.original || selectedShow.image?.medium} alt={selectedShow.name} />
              <div className="modal-banner-overlay" />
              <div className="modal-banner-content">
                <h2>{selectedShow.name}</h2>
                <div className="modal-actions">
                  <button className="btn-play">▶ Play</button>
                  <button className="btn-icon">+ Watchlist</button>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-left">
                <div className="modal-meta">
                  {selectedShow.rating?.average && (
                    <span className="modal-rating">⭐ {selectedShow.rating.average}/10</span>
                  )}
                  {selectedShow.status && (
                    <span className={`modal-status ${selectedShow.status === "Running" ? "green" : "gray"}`}>
                      {selectedShow.status}
                    </span>
                  )}
                  {selectedShow.premiered && (
                    <span className="modal-year">{selectedShow.premiered.slice(0, 4)}</span>
                  )}
                </div>
                <p className="modal-desc">{stripHtml(selectedShow.summary)}</p>
              </div>
              <div className="modal-right">
                {selectedShow.genres?.length > 0 && (
                  <p><span className="modal-label">Genres: </span>{selectedShow.genres.join(", ")}</p>
                )}
                {selectedShow.network?.name && (
                  <p><span className="modal-label">Network: </span>{selectedShow.network.name}</p>
                )}
                {selectedShow.language && (
                  <p><span className="modal-label">Language: </span>{selectedShow.language}</p>
                )}
                {selectedShow.schedule?.days?.length > 0 && (
                  <p><span className="modal-label">Airs: </span>
                    {selectedShow.schedule.days.join(", ")} at {selectedShow.schedule.time || "TBA"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;