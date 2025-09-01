import Breadcrumbs from "../components/breadcrumbs";

export default function AboutPage() {
    return (
        <section>
            <h1>About this site</h1>
            <Breadcrumbs />
            <p>Name: Nathanule Gibb</p>
            <p>Student-ID: 21982875</p>
            <p>This page explains the purpose of this project and links to the demo</p>
            <div style={{aspectRatio:"16 / 9", maxWidth: 960, margin: '2rem auto'}}>
                {/* Google Drive video embed */}
                <iframe
                    title="Project Walk-through Video"
                    width="100%"
                    height="100%"
                    src="https://drive.google.com/file/d/19tsm__-2arsHHAQD_Hyr-vtiogRsXbK_/preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ borderRadius: 12, border: '1px solid #ccc' }}
                />
            </div>
            <p>
                If the video does not play, you can watch it on google drive <a href="https://drive.google.com/file/d/19tsm__-2arsHHAQD_Hyr-vtiogRsXbK_/view?usp=sharing" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 700, color: '#007bff', textDecoration: 'underline', wordBreak: 'break-all' }}>Here!</a>.
            </p>
        </section>
    );
}
