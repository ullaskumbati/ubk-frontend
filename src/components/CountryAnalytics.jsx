import React, { useState, useEffect, useMemo } from 'react';
import { Globe, Search, ArrowUpDown, Users, MapPin, Landmark } from 'lucide-react';

export default function CountryAnalytics() {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [sortBy, setSortBy] = useState('population-desc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.restcountries.com/countries/v5', {
      headers: {
        'Authorization': 'Bearer rc_live_demo'
      }
    })
      .then((res) => res.json())
      .then((resData) => {
        const countryList = resData?.data?.objects || [];
        setCountries(countryList);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching countries:', err);
        setLoading(false);
      });
  }, []);

  const filteredCountries = useMemo(() => {
    return countries
      .filter((c) => {
        const nameCommon = c.names?.common || '';
        const matchesSearch = nameCommon.toLowerCase().includes(search.toLowerCase());
        const matchesRegion = selectedRegion === 'All' || c.region === selectedRegion;
        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortBy === 'population-desc') return b.population - a.population;
        if (sortBy === 'population-asc') return a.population - b.population;
        if (sortBy === 'name-asc') return (a.names?.common || '').localeCompare(b.names?.common || '');
        return 0;
      });
  }, [countries, search, selectedRegion, sortBy]);

  const totalPopulation = useMemo(() => {
    return filteredCountries.reduce((acc, c) => acc + (c.population || 0), 0);
  }, [filteredCountries]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-cyan-400 font-mono text-xs">
        Loading Country Analytics...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
          <Globe className="text-cyan-400" size={24} /> Global Demographics & Analytics
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Explore world regions, real-time population metrics, and geographic statistics.
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#0d121f] p-5 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Filtered Entities</span>
            <Landmark size={18} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{filteredCountries.length}</p>
        </div>
        <div className="bg-[#0d121f] p-5 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Total Filtered Population</span>
            <Users size={18} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{totalPopulation.toLocaleString()}</p>
        </div>
        <div className="bg-[#0d121f] p-5 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Region</span>
            <MapPin size={18} className="text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">{selectedRegion}</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-[#0d121f] p-4 rounded-2xl border border-slate-800/80">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Search country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#07090e] border border-slate-800 pl-10 pr-4 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="bg-[#07090e] border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="All">All Regions</option>
            <option value="Africa">Africa</option>
            <option value="Americas">Americas</option>
            <option value="Asia">Asia</option>
            <option value="Europe">Europe</option>
            <option value="Oceania">Oceania</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#07090e] border border-slate-800 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="population-desc">Population: High to Low</option>
            <option value="population-asc">Population: Low to High</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>
      </div>

      {/* Country Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredCountries.map((country) => {
          const commonName = country.names?.common || 'Unknown';
          const flagPng = country.flag?.url_png;
          const flagEmoji = country.flag?.emoji || '🏳️';
          const capitalName = country.capitals?.[0]?.name || 'N/A';
          const pop = country.population || 0;

          return (
            <div
              key={commonName}
              className="bg-[#0d121f] border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col hover:border-cyan-500/50 transition-all group"
            >
              {flagPng ? (
                <img
                  src={flagPng}
                  alt={commonName}
                  className="h-32 w-full object-cover border-b border-slate-800/80 group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="h-32 w-full flex items-center justify-center text-4xl bg-[#07090e] border-b border-slate-800/80">
                  {flagEmoji}
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                    <span className="text-base">{flagEmoji}</span> <span className="truncate">{commonName}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{country.region} • {capitalName}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Population</span>
                  <span className="font-mono font-medium text-cyan-400">{pop.toLocaleString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}