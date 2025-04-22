import React, { useEffect, useRef, useState } from "react";
import DisplayCard from "./DisplayCard";
import { useDebounce } from 'use-debounce';

const genderTypes = [
    'Female', 'Male', 'Genderless', 'unknown'
];

function ZetaLayout() {
  const [data, setData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [filterName, setFilterName] = useState("");
  const [pageInfo, setPageInfo] = useState({});
  const [gender, setGender] = useState('');
  const [laoding, setLoading] = useState(true);
  const scrollRef = useRef();
  const [debouncedFilter] = useDebounce(filterName, 500);

  const fetchDataByPage = async () => {
    try {
        setLoading(true)
      const data = await fetch(
        `https://rickandmortyapi.com/api/character/?page=${pageNumber}&name=${debouncedFilter}&gender=${gender}`
      );
      if (!data.ok) {
        throw "Data Not Found";
      }
      const response = await data.json();
      if(!filterName && !gender) {
         setData(prev => [...prev, ...response.results]);
      } else {
        setData(response.results);
      }
      setPageInfo(response.info);
      setLoading(false)
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  };

  useEffect(()=> {
    fetchDataByPage();
  }, [filterName, pageNumber, gender])

 const handleScroll = () => {
    const div = scrollRef?.current;
    if(div && div.scrollHeight - div.scrollTop <= div.clientHeight + 1) {
        setPageNumber(prev => prev + 1);
    }
 }

  return (
    <div className="container mt-3">
      <div className="row mb-4">
        <h4 className="mb-1">Ricky and Morty</h4>
        <span>Find your favourite character</span>
      </div>
      <div className="row mb-4">
        <div className="col-md-8">
          <input className="form-control" placeholder="Enter Name..." value={filterName} onChange={(e)=> setFilterName(e.target.value)} />
        </div>
        <div className="col-md-4">
          <select className="form-control" value={gender} onChange={(e)=> setGender(e.target.value)}>
            <option value={''}>All</option>
            {
                genderTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)
            }
          </select>
        </div>
      </div>
      <div className="scrollablediv" ref={scrollRef} onScroll={handleScroll}>
        <div className="row">
            {data.map((ele) => (
            <div className="col-md-4" key={ele.id}>
                <DisplayCard  data={ele} />
            </div>
            ))}
        </div>
      </div>

      <div>
      {laoding &&  <h6>Loading More Characters</h6> }
      </div>
      
    </div>
  );
}

export default ZetaLayout;
