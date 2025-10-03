import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Lightweight animated background (starfield / particles)
// Renders once and reuses a single point cloud for performance.
export const Background3D: React.FC = () => {
	const mountRef = useRef<HTMLDivElement | null>(null);
	const rendererRef = useRef<THREE.WebGLRenderer>();

	useEffect(() => {
		const mount = mountRef.current;
		if (!mount) return;
		const width = mount.clientWidth;
		const height = mount.clientHeight;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
		camera.position.z = 45;

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(width, height);
		rendererRef.current = renderer;
		mount.appendChild(renderer.domElement);

		// Gradient backdrop using a big plane with shader-like material (simple)
		const gradGeo = new THREE.PlaneGeometry(400, 400, 1, 1);
		const gradMat = new THREE.MeshBasicMaterial({
			color: 0x0f172a,
		});
		const gradMesh = new THREE.Mesh(gradGeo, gradMat);
		gradMesh.position.z = -120;
		scene.add(gradMesh);

		// Star / particle field
		const particleCount = 850;
		const positions = new Float32Array(particleCount * 3);
		for (let i = 0; i < particleCount; i++) {
			const i3 = i * 3;
			// Spread in a sphere-ish volume
			positions[i3] = (Math.random() - 0.5) * 160;
			positions[i3 + 1] = (Math.random() - 0.5) * 160;
			positions[i3 + 2] = (Math.random() - 0.5) * 160;
		}
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		const material = new THREE.PointsMaterial({
			size: 1.6,
			sizeAttenuation: true,
			color: new THREE.Color('#6366f1'),
			transparent: true,
			opacity: 0.7,
		});
		const points = new THREE.Points(geometry, material);
		scene.add(points);

		let frameId: number;
		const clock = new THREE.Clock();
		const animate = () => {
			frameId = requestAnimationFrame(animate);
			const t = clock.getElapsedTime();
			points.rotation.y = t * 0.04;
			points.rotation.x = Math.sin(t * 0.15) * 0.15;
			renderer.render(scene, camera);
		};
		animate();

		const handleResize = () => {
			if (!mount) return;
			const w = mount.clientWidth;
			const h = mount.clientHeight;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
			renderer.setSize(w, h);
		};
		window.addEventListener('resize', handleResize);

		return () => {
			cancelAnimationFrame(frameId);
			window.removeEventListener('resize', handleResize);
			geometry.dispose();
			material.dispose();
			gradGeo.dispose();
			renderer.dispose();
			if (renderer.domElement.parentNode) {
				renderer.domElement.parentNode.removeChild(renderer.domElement);
			}
		};
	}, []);

	return (
		<div
			ref={mountRef}
			aria-hidden
			className="pointer-events-none fixed inset-0 -z-10 select-none bg-[radial-gradient(circle_at_30%_30%,#1e293b,#0f172a_65%)]"
		/>
	);
};
