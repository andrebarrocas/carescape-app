export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-primary">About CareSpace</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          CareSpace is a platform dedicated to documenting and sharing natural
          colors found in our environment. Our mission is to create a global
          community of color enthusiasts who appreciate the beauty and
          sustainability of natural pigments.
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-primary">Our Mission</h2>
        <p className="mt-4 text-muted-foreground">
          We believe in the power of natural colors to connect us with our
          environment and traditional practices. By documenting these colors and
          their sources, we aim to:
        </p>
        <ul className="mt-4 space-y-2 list-disc list-inside text-muted-foreground">
          <li>Preserve traditional color-making knowledge</li>
          <li>Promote sustainable and natural alternatives to synthetic dyes</li>
          <li>Create a global map of natural color sources</li>
          <li>Build a community of color enthusiasts and artisans</li>
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-primary">How It Works</h2>
        <div className="mt-4 grid gap-6">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium text-primary">
              1. Document Colors
            </h3>
            <p className="mt-2 text-muted-foreground">
              Upload photos of your natural color sources and document the
              extraction process. Our platform helps you capture important details
              like location, season, and material properties.
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium text-primary">2. Share Knowledge</h3>
            <p className="mt-2 text-muted-foreground">
              Contribute your expertise by sharing traditional techniques,
              applications, and tips for working with natural colors. Help others
              learn and grow in their color journey.
            </p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-lg font-medium text-primary">
              3. Explore & Connect
            </h3>
            <p className="mt-2 text-muted-foreground">
              Discover colors from around the world, connect with other
              enthusiasts, and learn about different cultural approaches to natural
              color-making.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-primary">Join Us</h2>
        <p className="mt-4 text-muted-foreground">
          Whether you're a professional artist, a curious beginner, or simply
          someone who appreciates the beauty of natural colors, we welcome you to
          join our community. Together, we can build a more sustainable and
          colorful future.
        </p>
      </div>
    </div>
  );
} 