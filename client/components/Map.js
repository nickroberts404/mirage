import React, {Component, PropTypes} from 'react';
import { mapboxKey, mapboxStyle } from '../../config';
import equal from 'deep-equal';
const mapbox = require('mapbox-gl/dist/mapbox-gl.js');
const MapboxDraw = require('@mapbox/mapbox-gl-draw');
mapbox.accessToken = mapboxKey;

export default class MainMap extends Component {

	constructor(props) {
		super(props);
		this.state = {map: null, nodes: props.nodes}
	}

	componentDidMount() {
		this._mapLoaded = false;
		const Draw = new MapboxDraw({
			displayControlsDefault: false,
		    controls: {
		        polygon: true,
		        trash: true
		    }
		});
		const map = new mapbox.Map({
			container: 'map',
			style: mapboxStyle,
			center: [-97.7431, 30.2672],
			zoom: 3,
		});
		map.addControl(Draw);
		map.on('load', ()=> this._mapLoaded = true);
		this.setState({map});
	}

	componentWillReceiveProps(nextProps) {
		const { map, nodes } = this.state;
		// If the server did not send different nodes than the ones we had before, do not update.
		if(!equal(nextProps.nodes, nodes)) {
			if(!this._mapLoaded) map.on('load', ()=> addPoints(nextProps.nodes, map))
			else addPoints(nextProps.nodes, map);
			this.setState({nodes: nextProps.nodes});
		}
	}

	render() {
		return <div id="map" className="map"></div>
	}
}

MainMap.propTypes = {
	nodes: PropTypes.array.isRequired,
}

const addPoints = (points, map) => {
	if(points.length < 1) return false;
	const geoJSON = getGeoJSON(points, i => [i.lng, i.lat]);
	// Remove old layers
	if(map.getSource('points')) map.removeSource('points');
	if(map.getLayer('points')) map.removeLayer('points');

	const circleRadius = {stops: [[8, 3], [11, 7], [16, 15]]};
	map.addSource('points', {
		type: 'geojson',
		data: geoJSON,
	});
	map.addLayer({
		id: 'points',
		type: 'circle',
		source: 'points',
		paint: {
			'circle-radius': circleRadius,
			'circle-color': '#1eaedb',
		}
	})
}

const getGeoJSON = (items, getCoordinates) => {
	let geo = {
		type: "FeatureCollection"
	}
	geo.features = items.map(i => ({
		type: "Feature",
		geometry: {
			type: "Point",
			coordinates: getCoordinates(i),
		}
	}))
	return geo;
}