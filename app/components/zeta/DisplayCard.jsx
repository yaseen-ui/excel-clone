import React from "react";

function DisplayCard({ data = {} }) {

  return (
    <div>
      <div className="card p-3 m-2">
        <div className="row">
          <div className="col-md-4 mb-3">
            <img src={data.image} alt="Image" className="display-img" />
          </div>
          <div className="col-md-8">
            <div className="center-content">
            <h4>{data.name}</h4>
            <label>
            <strong>Location:</strong> {data.location?.name}
            </label>
            <label>
            <strong>Gender:</strong> {data.gender}
            </label>
            </div>
          </div>
          <div className="col-md-12">
            <label>
            <strong>First Episode:</strong> {data.episode?.length ? `S01E01`: 'Blah Blah'} 
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisplayCard;
