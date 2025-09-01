import Breadcrumbs from "../breadcrumbs";

export default function AboutPage() {
    return (
        <section>
            <h1>About this site</h1>
            <Breadcrumbs />
            <p>Name: Nathanule Gibb</p>
            <p>Student-ID: 21982875</p>
            <p>This page explains the purpose of this project and links to the demo</p>
            <div style={{aspectRatio:"16 / 9", maxWidth: 960}}>
            <iframe
                title="How to use this website"
                width="100%" height="100%" src="https://link_here"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            />
            </div>
        </section>
    );
}